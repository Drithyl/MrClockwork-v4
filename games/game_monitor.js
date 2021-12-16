
const log = require("../logger.js");
const assert = require("../asserter.js");
const config = require("../config/config.json");
const ongoingGameStore = require("./ongoing_games_store.js");
const serverStore = require("../servers/host_server_store.js");
const botClientWrapper = require("../discord/wrappers/bot_client_wrapper.js");
const dom5Status = require("./prototypes/dominions5_status.js");
const dom5SettingFlags = require("../json/dominions5_setting_flags.json");
const MessagePayload = require("../discord/prototypes/message_payload.js");

const UPDATE_INTERVAL = config.gameUpdateInterval;
const MAX_PARALLEL_UPDATES = config.gameUpdateInterval;
const monitoredGames = [];
var currentPendingGameIndex = 0;
var currentUpdates = 0;

// Start the interval to launch as many queries as the MAX_PARALLEL_UPDATES,
// or the amount of monitoredGames, whichever is smaller
exports.startGameUpdates = () => setInterval(_updateDom5Games, UPDATE_INTERVAL);


// Add a game to be monitored and updated
exports.monitorDom5Game = (game) =>
{
    if (monitoredGames.find((g) => g.getName() === game.getName()) != null)
        return log.general(log.getLeanLevel(), `${game.getName()} is already being monitored.`);
        
    monitoredGames.push(game);
    log.general(log.getNormalLevel(), `${game.getName()} will be monitored for updates.`);
};

// Remove a game from the monitoring list
exports.stopMonitoringDom5Game = (game) =>
{
    for (var i = 0; i < monitoredGames.length; i++)
    {
        if (monitoredGames[i].getName() === game.getName())
        {
            monitoredGames.splice(i, 1);
            return log.general(log.getLeanLevel(), `${game.getName()} will no longer be monitored for updates.`);
        }
    }
    
    log.general(log.getLeanLevel(), `${game.getName()} is not in the list of monitored games; no need to remove.`);
};


// Launch as many queries as the space allows, between the currentUpdates and the
// max allowed, as well as number of games. Each time, increment the currentPendingGameIndex
// so the next loop starts a different game. Once a query finishes, reduce the number
// of running queries for the next interval. 
function _updateDom5Games()
{
    // Queued up updates guarantee that every game update will always be
    // spaced out by at least a certain time. This is relevant because Discord rate limits
    // will be very affected by the game's status embed editing. This route falls under global
    // rate limits, which should be of 50 requests per second. More information below:
    // https://discord.com/developers/docs/topics/rate-limits
    while(currentUpdates < MAX_PARALLEL_UPDATES && currentUpdates < monitoredGames.length)
    {
        const gameToUpdate = monitoredGames[currentPendingGameIndex];

        _increasePendingGameIndex();

        if (gameToUpdate == null)
            continue;

        if (ongoingGameStore.hasOngoingGameByName(gameToUpdate.getName()) === false)
        {
            log.general(log.getLeanLevel(), `${gameToUpdate.getName()} not found on store; removing from list.`);
            exports.stopMonitoringDom5Game(gameToUpdate);
            continue;
        }
     
        currentUpdates++;
        log.general(log.getVerboseLevel(), `Total game updates running now: ${currentUpdates}`);

        _updateCycle(gameToUpdate)
        .then(() => 
        {
            _reduceCurrentUpdates();
            log.general(log.getVerboseLevel(), `Game update finished, reducing current queries.`);
        })
        .catch((err) => 
        {
            _reduceCurrentUpdates();
            log.error(log.getNormalLevel(), `ERROR UPDATING DOM5 GAME ${gameToUpdate.getName()}`, err);
        });
    }
}

function _increasePendingGameIndex()
{
    currentPendingGameIndex++;
    if (currentPendingGameIndex >= monitoredGames.length)
        currentPendingGameIndex = 0;
}

function _reducePendingGameIndex()
{
    currentPendingGameIndex--;
    if (currentPendingGameIndex < 0)
        currentPendingGameIndex = monitoredGames.length - 1;
}

function _reduceCurrentUpdates()
{
    currentUpdates--;
    if (currentUpdates < 0)
        currentUpdates = 0;
}

async function _updateCycle(game)
{
    // Get our game's last recorded status
    const lastKnownStatus = game.getLastKnownStatus();

    log.general(log.getVerboseLevel(), `${game.getName()}\tupdating...`);

    if (game.getServer() == null)
    {
        log.error(log.getVerboseLevel(), `${game.getName()} UPDATE ERROR; NO SERVER OBJECT FOUND IN GAME`);
        return Promise.resolve();
    }

    // Fetch the most recent status of the game
    const updatedStatus = await dom5Status.fetchDom5Status(game);
    
    // Handle the timer update
    _updateTimer(game, lastKnownStatus, updatedStatus);
    await _updateGameEvents(game, lastKnownStatus, updatedStatus);

    // Update our game's data with the generated updated status
    game.update(updatedStatus);
    await game.save();
}

function _updateTimer(game, lastKnownStatus, updatedStatus)
{
    const elapsedTimeSinceLastUpdate = updatedStatus.getUptimeSinceLastCheck();

    // If the bot is not enforcing the timer, then Dominions updates its own
    // timer without us having to manually do it, so skip this step
    // If the game is offline, we also don't want to advance timers
    if (game.isEnforcingTimer() === false || updatedStatus.isOnline() === false || updatedStatus.isServerOnline() === false)
        return;

    // If bot is enforcing timer, but there are no last known ms, set them to 
    // the full timer. This happens when patching games from v3 to v4, for example
    if (assert.isInteger(lastKnownStatus.getMsLeft()) === false)
    {
        log.general(log.getLeanLevel(), `${game.getName()}'s msLeft is null or incorrect; setting to default.`);
        lastKnownStatus.setMsToDefaultTimer(game);
        log.general(log.getLeanLevel(), `${game.getName()} set to ${lastKnownStatus.getMsLeft()}ms.`);
    }

    // Set our new status to the last known bot enforced timer, to be on the same page
    updatedStatus.copyTimerValues(lastKnownStatus);

    // Advance the timer if it's not paused. This still needs to be updated with the
    // game status itself; it's only a simulation until the game.update() line gets called
    if (updatedStatus.isPaused() === false)
        updatedStatus.advanceTimer(elapsedTimeSinceLastUpdate);
}

async function _updateGameEvents(game, lastKnownStatus, updatedStatus)
{
    // Calculate all game events that happened in this update
    const gameEvents = _getGameEvents(updatedStatus, lastKnownStatus);

    // Attach the new game events to our status object, to enhance it for ease of checking
    Object.assign(updatedStatus, gameEvents);

    // Update the status embed with the new data (in case game went offline, for example)
    log.general(log.getVerboseLevel(), `${game.getName()}\tupdating embed.`);
    //game.updateStatusEmbed(updateData);

    log.general(log.getVerboseLevel(), 
    `${game.getName()}\treceived updated data`,
    `\tcurrentStatus:\t\t${updatedStatus.getStatus()}
    \tcurrentMsLeft:\t\t${updatedStatus.getMsLeft()}
    \tcurrentTurnNumber:\t${updatedStatus.getTurnNumber()}
    \tcurrent isPaused:\t${updatedStatus.isPaused()}\n
    \tlastKnownStatus:\t${lastKnownStatus.getStatus()}
    \tlastKnownMsLeft:\t${lastKnownStatus.getMsLeft()}
    \tlastKnownTurnNumber:\t${lastKnownStatus.getTurnNumber()}
    \tlastKnown isPaused:\t${lastKnownStatus.isPaused()}`);

    // Act on the calculated game events (i.e. roll a new turn, send a new turn announcement...)
    await _handleGameEvents(game, updatedStatus);
}

function _getGameEvents(updatedStatus, lastKnownStatus)
{
    const currentTurnNumber = updatedStatus.getTurnNumber();

    const lastKnownMsLeft = lastKnownStatus.getMsLeft();
    const lastTurnTimestamp = lastKnownStatus.getLastTurnTimestamp();
    const lastKnownTurnNumber = lastKnownStatus.getTurnNumber();
            
    const lastKnownHourMark = Math.floor(lastKnownMsLeft / 1000 / 3600);
    const currentHourMark = Math.floor(updatedStatus.getMsLeft() / 1000 / 3600);

    const events = {

        // Data that has the same timestamp than the previous data is not considered "new", as statusdump didn't update
        isNewData:              updatedStatus.getLastUpdateTimestamp() > lastKnownStatus.getLastUpdateTimestamp(),
        didServerGoOffline:     updatedStatus.isServerOnline() === false && lastKnownStatus.isServerOnline() === true,
        didGameGoOffline:       updatedStatus.isOnline() === false && lastKnownStatus.isOnline() === true,
        isServerBackOnline:     updatedStatus.isServerOnline() === true && lastKnownStatus.isServerOnline() === false,
        isGameBackOnline:       updatedStatus.isOnline() === true && lastKnownStatus.isOnline() === false,
        didGameStart:           updatedStatus.isOngoing() === true && lastKnownStatus.isInLobby() === true,
        didGameRestart:         updatedStatus.isInLobby() === true && lastKnownStatus.isOngoing() === true,
        didHourPass:            updatedStatus.getMsLeft() != null && lastKnownHourMark !== currentHourMark,
        isLastHourBeforeTurn:   updatedStatus.isOngoing() === true && lastKnownHourMark !== currentHourMark && currentHourMark === 0,
        isNewTurn:              assert.isInteger(currentTurnNumber) === true && assert.isInteger(lastKnownTurnNumber) === true &&
                                currentTurnNumber > 0 && currentTurnNumber > lastKnownTurnNumber,
        wasTurnRollbacked:      assert.isInteger(currentTurnNumber) === true && assert.isInteger(lastKnownTurnNumber) === true &&
                                currentTurnNumber > 0 && currentTurnNumber < lastKnownTurnNumber,
        lastTurnTimestamp
    };

    // If it is a new turn, update the timestamp of the last turn
    if (events.isNewTurn === true)
        updatedStatus.setLastTurnTimestamp(Date.now());

    return events;
}


function _handleGameEvents(game, updateData)
{
    // If our bot is enforcing the timer, then we check here if any turns need to
    // be forced to roll, or if we need to set the timer to the new turn's timer
    if (game.isEnforcingTimer() === true)
        _handleTimerEvents(game, updateData);

    /** Order of conditionals matters! A new turn or a restart must be caught before
     *  the server or the game coming back online, as those will only trigger once
     */

    if (updateData.didServerGoOffline === true)
        return _handleServerOffline(game);

    else if (updateData.didGameGoOffline === true)
        return _handleGameOffline(game);

    else if (updateData.didGameStart === true)
        return _handleGameStarted(game);

    else if (updateData.didGameRestart === true)
        return _handleGameRestarted(game);

    else if (updateData.isLastHourBeforeTurn === true)
        return _handleLastHourBeforeTurn(game, updateData);

    else if (updateData.isNewTurn === true)
        return _handleNewTurn(game, updateData);

    else if (updateData.wasTurnRollbacked === true)
        return _handleTurnRollback(game, updateData);

    if (updateData.didHourPass === true)
        return _handleHourPassed(game, updateData);

    else if (updateData.isServerBackOnline === true)
        return _handleServerBackOnline(game);

    else if (updateData.isGameBackOnline === true)
        return _handleGameBackOnline(game);
}


function _handleTimerEvents(game, updateData)
{
    if (updateData.isNewTurn === true || updateData.wasTurnRollbacked === true || updateData.didGameStart === true)
    {
        log.general(log.getNormalLevel(), `Setting ${game.getName()}'s timer back to default.`);
        updateData.setMsToDefaultTimer(game);
        log.general(log.getNormalLevel(), `${game.getName()} set to ${updateData.getMsLeft()}ms.`);
    }

    else if (updateData.getTurnNumber() > 0 && updateData.getMsLeft() <= 0 && updateData.isPaused() === false && game.isTurnProcessing() === false)
    {
        _handleTurnReadyToHost(game, updateData);
    }
}

function _handleServerOffline(game)
{
    game.sendMessageToChannel(`Host server is offline. It will be back online shortly.`);
}

function _handleGameOffline(game)
{
    // Don't announce in channel, as sometimes games will go offline and right back up due to
    // things like killing and relaunching from a rollback, or hiccups. Players generally
    // get confused for no reason
    //game.sendMessageToChannel(`Game process is offline. Use the launch command to relaunch it.`);
}

function _handleGameStarted(game)
{
    log.general(log.getNormalLevel(), `${game.getName()}\tstarted.`);
    game.sendGameAnnouncement(`The game has started!`);
}

function _handleGameRestarted(game)
{
    log.general(log.getNormalLevel(), `${game.getName()}\trestarted.`);
    game.sendGameAnnouncement(`The game has restarted; please submit your pretenders!`);
}

async function _handleLastHourBeforeTurn(game, updateData)
{
    const uncheckedTurns = updateData.getUncheckedTurns();
    const announcementStr = `There is less than an hour remaining for the new turn.`;

    log.general(log.getNormalLevel(), `${game.getName()}\t~1h left for new turn.`);

    if (uncheckedTurns.length <= 0)
        return game.sendGameAnnouncement(announcementStr);

    game.sendGameAnnouncement(announcementStr + ` The following turns have not been checked at all by their players yet:\n\n${uncheckedTurns.join("\n").toBox()}`);
}

function _handleNewTurn(game, updateData)
{
    log.general(log.getNormalLevel(), `${game.getName()}\tnew turn.`);

    updateData.setIsTurnProcessing(false);
    game.sendGameAnnouncement(`Turn ${updateData.getTurnNumber()} has arrived.`);
    _processNewTurnPreferences(game, updateData.getTurnNumber());
    _processStales(game, updateData);
}

function _handleTurnRollback(game, updateData)
{
    log.general(log.getNormalLevel(), `${game.getName()}\trollbacked turn.`);
    game.sendGameAnnouncement(`The game has been rollbacked to turn ${updateData.getTurnNumber()}.`);
}

function _handleTurnReadyToHost(game, updateData)
{
    log.general(log.getNormalLevel(), `${game.getName()}\t Forcing turn to roll...`);
    game.forceHost();
}

function _handleHourPassed(game, updateData)
{
    const hourMarkPassed = Math.ceil(updateData.getMsLeft() / 1000 / 3600);
    
    log.general(log.getVerboseLevel(), `${game.getName()}\tHour mark ${hourMarkPassed} passed.`);
    _processNewHourPreferences(game, updateData.getPlayers(), hourMarkPassed);
}

function _handleServerBackOnline(game)
{
    game.sendMessageToChannel(`Host server is online again. If the game does not go online shortly, you can relaunch it.`);
}

function _handleGameBackOnline(game)
{
    // Don't announce in channel, as sometimes games will go offline and right back up due to
    // things like killing and relaunching from a rollback, or hiccups. Players generally
    // get confused for no reason
    //game.sendMessageToChannel(`Game process is back online.`);
}


function _processNewTurnPreferences(game, turnNumber)
{
    const nationFilesToFetch = [];
    const gameName = game.getName();
    const settings = game.getSettingsObject();
    const scoregraphs = settings.getScoregraphsSetting();
    const scoregraphsValue = scoregraphs.getValue();
    const filesRequestingBackups = [];

    game.forEachPlayerFile((playerFile) =>
    {
        const preferences = playerFile.getEffectiveGamePreferences(gameName);
        
        if (preferences.isReceivingBackups() === true)
        {
            const controlledNations = playerFile.getControlledNationFilenamesInGame(gameName);

            nationFilesToFetch.push( ...controlledNations );
            filesRequestingBackups.push(playerFile);
        }
    });

    if (filesRequestingBackups.length <= 0)
        return;

    game.emitPromiseWithGameDataToServer("GET_TURN_FILES", { nationNames: nationFilesToFetch })
    .then((turnFiles) =>
    {
        const scoresFile = turnFiles.scores;
        const nationTurnFiles = turnFiles.turnFiles;

        filesRequestingBackups.forEach((playerFile) =>
        {
            const preferences = playerFile.getEffectiveGamePreferences(gameName);
            const controlledNations = playerFile.getControlledNationFilenamesInGame(gameName);
            const payload = new MessagePayload(`Find below your nation files for turn ${turnNumber}.`)

            botClientWrapper.fetchUser(playerFile.getId())
            .then((userWrapper) =>
            {
                if (preferences.isReceivingScores() === true && +scoregraphsValue === +dom5SettingFlags.VISIBLE_SCOREGRAPHS)
                    payload.setAttachment(`scores.html`, scoresFile);

                controlledNations.forEach((nationFilename) =>
                {
                    if (nationTurnFiles[nationFilename] != null)
                        payload.setAttachment(`${nationFilename}.trn`, nationTurnFiles[nationFilename]);
                });

                return userWrapper.sendMessage(payload);
            })
            .catch((err) => log.error(log.getNormalLevel(), `ERROR SENDING NATION BACKUPS TO PLAYER ${playerFile.getId()}`, err));
        });
    })
    .catch((err) => log.error(log.getNormalLevel(), `ERROR FETCHING NATION BACKUP FILES`, err));
}

function _processNewHourPreferences(game, playerTurnData, hourMarkPassed)
{
    const gameName = game.getName();

    game.forEachPlayerFile((file) =>
    {
        const preferences = file.getEffectiveGamePreferences(gameName);
        const controlledNationsByFullName = file.getControlledNationFilenamesInGame(gameName);
        
        if (preferences.hasReminderAtHourMark(hourMarkPassed) === true)
        {
            for (var i = 0; i < controlledNationsByFullName.length; i++)
            {
                const nationFullName = controlledNationsByFullName[i];
                const nationTurnData = playerTurnData.find((nationData) => nationData.name.toLowerCase() === nationFullName.toLowerCase());

                if (nationTurnData != null)
                {
                    if (nationTurnData.isTurnFinished === false || (nationTurnData.isTurnFinished === true && preferences.isReceivingRemindersWhenTurnIsDone() === true))
                    {
                        var _userWrapper;

                        botClientWrapper.fetchUser(file.getId())
                        .then((userWrapper) => 
                        {
                            _userWrapper = userWrapper;
                            return _userWrapper.sendMessage(new MessagePayload(`There are less than ${hourMarkPassed} hours left for the next turn in ${gameName}.`));
                        })
                        .catch((err) => log.error(log.getNormalLevel(), `ERROR SENDING REMINDER TO USER ${_userWrapper.getUsername} (${_userWrapper.getId()})`, err));
    
                        break;
                    }
                }
            }
        }
    });
}

function _processStales(game, updateData)
{
    var staleMessage = `**${game.getName()}**'s stale data for **turn ${updateData.getTurnNumber()}**:\n\n`;

    game.emitPromiseWithGameDataToServer("GET_STALES")
    .then((staleData) =>
    {
        if (staleData.wentAi.length <= 0 && staleData.stales.length <= 0)
            return Promise.resolve();

        if (staleData.wentAi.length > 0)
            staleMessage += `Nations that **went AI**:\n\n${staleData.wentAi.join("\n").toBox()}\n\n`;
        
        if (staleData.stales.length > 0)
            staleMessage += `Nations that **staled**:\n\n${staleData.stales.join("\n").toBox()}`;

        else staleMessage += `No stales happened`;

        return game.sendMessageToOrganizer(staleMessage);
    })
    .catch((err) => 
    {
        log.error(log.getLeanLevel(), `${game.getName()}\tError processing stales`, err);
        game.sendMessageToOrganizer(staleMessage + `Could not get stale data: ${err.message}`);
    });
}

function _checkIfAllTurnsAreDone(game)
{
    return game.emitPromiseWithGameDataToServer("GET_UNDONE_TURNS")
    .then((undoneTurns) =>
    {
        if (assert.isArray(undoneTurns) === false)
            return Promise.reject(new Error("No nation turn data available"));

        if (undoneTurns.length <= 0)
            return Promise.resolve(true);

        else return Promise.resolve(false);
    })
    .catch((err) => 
    {
        log.error(log.getLeanLevel(), `${game.getName()}\tError checking if all turns are done`, err);
        return Promise.resolve(false);
    });
}