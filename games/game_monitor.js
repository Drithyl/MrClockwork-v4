
const log = require("../logger.js");
const assert = require("../asserter.js");
const ongoingGameStore = require("./ongoing_games_store.js");
const botClientWrapper = require("../discord/wrappers/bot_client_wrapper.js");
const { queryDominions5Game } = require("./prototypes/dominions5_status.js");
const MessagePayload = require("../discord/prototypes/message_payload.js");

const MAX_SIMULTANEOUS_QUERIES = 10;
const UPDATE_INTERVAL = 10000;
const monitoredGames = [];
var currentPendingGameIndex = 0;
var currentQueries = 0;


// Start the interval to launch as many queries as the MAX_SIMULTANEOUS_QUERIES,
// or the amount of monitoredGames, whichever is smaller
_queueGameUpdates();


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

// Start the timeout for a new round of game updates
function _queueGameUpdates()
{
    setInterval(_updateDom5Games, UPDATE_INTERVAL);
}

// Launch as many queries as the space allows, between the currentQueries and the
// max allowed, as well as number of games. Each time, increment the currentPendingGameIndex
// so the next loop starts a different game. Once a query finishes, reduce the number
// of running queries for the next interval. 
function _updateDom5Games()
{
    while(currentQueries < MAX_SIMULTANEOUS_QUERIES && currentQueries < monitoredGames.length)
    {
        var gameToUpdate = monitoredGames[currentPendingGameIndex];
        _cyclePendingGameIndex();

        if (gameToUpdate == null)
            continue;

        if (ongoingGameStore.hasOngoingGameByName(gameToUpdate.getName()) === false)
        {
            log.general(log.getLeanLevel(), `${gameToUpdate.getName()} not found on store; removing from list.`);
            exports.stopMonitoringDom5Game(gameToUpdate);
            continue;
        }

        // Queries with offline servers are pointless
        if (gameToUpdate.isServerOnline() === false)
            continue;
     
        currentQueries++;
        log.general(log.getVerboseLevel(), `Total queries running now: ${currentQueries}`);

        _updateCycle(gameToUpdate)
        .then(() => 
        {
            _reduceQueries();
            log.general(log.getVerboseLevel(), `Query finished, reducing current queries.`);
        })
        .catch((err) => 
        {
            _reduceQueries();
            log.error(log.getNormalLevel(), `ERROR UPDATING DOM5 GAME ${gameName}`, err);
        });
    }
}

function _cyclePendingGameIndex()
{
    currentPendingGameIndex++;
    if (currentPendingGameIndex >= monitoredGames.length)
        currentPendingGameIndex = 0;
}

function _reduceQueries()
{
    currentQueries--;
    if (currentQueries < 0)
        currentQueries = 0;
}

function _updateCycle(game)
{
    const lastKnownStatus = game.getLastKnownStatus();

    log.general(log.getVerboseLevel(), `${game.getName()}\tupdating...`);

    if (game.getServer() == null)
    {
        log.error(log.getVerboseLevel(), `${game.getName()} UPDATE ERROR; NO SERVER OBJECT FOUND IN GAME`);
        return Promise.resolve();
    }

    return queryDominions5Game(game)
    .then((updatedStatus) =>
    {
        if (game.isEnforcingTimer() === false)
            return Promise.resolve(updatedStatus);

        if (assert.isInteger(lastKnownStatus.getMsLeft()) === false)
        {
            log.general(log.getLeanLevel(), `${game.getName()}'s msLeft is null or incorrect; setting to default.`);
            lastKnownStatus.setMsToDefaultTimer(game);
            log.general(log.getLeanLevel(), `${game.getName()} set to ${lastKnownStatus.getMsLeft()}ms.`);
        }

        updatedStatus.copyTimerValues(lastKnownStatus);

        if (updatedStatus.isPaused() === false)
            updatedStatus.moveTimerBy(UPDATE_INTERVAL);

        return Promise.resolve(updatedStatus);
    })
    .then((updatedStatus) =>
    {
        const gameEvents = _getGameEvents(updatedStatus, lastKnownStatus);
        const updateData = Object.assign(updatedStatus, gameEvents);

        log.general(log.getVerboseLevel(), `${game.getName()}\tupdating embed.`);
        game.updateStatusEmbed(updateData);


        if (updatedStatus.isServerOnline() === false)
        {
            log.general(log.getVerboseLevel(), `${game.getName()}\tserver offline; cannot update.`);
            return Promise.resolve();
        }

        else if (updatedStatus.isOnline() === false)
        {    
            log.general(log.getVerboseLevel(), `${game.getName()}\t offline; cannot update.`);
            return Promise.resolve();
        }


        log.general(log.getVerboseLevel(), 
        `${game.getName()}\treceived updated data`,
        `\tcurrentStatus:\t\t${updateData.getStatus()}
        \tcurrentMsLeft:\t\t${updateData.getMsLeft()}
        \tcurrentTurnNumber:\t${updateData.getTurnNumber()}
        \tcurrent isPaused:\t${updateData.isPaused()}\n
        \tlastKnownStatus:\t${lastKnownStatus.getStatus()}
        \tlastKnownMsLeft:\t${lastKnownStatus.getMsLeft()}
        \tlastKnownTurnNumber:\t${lastKnownStatus.getTurnNumber()}
        \tlastKnown isPaused:\t${lastKnownStatus.isPaused()}`);


        _handleGameEvents(game, updateData);
        game.update(updateData);
        return Promise.resolve();
    })
    .then(() => game.save())
    .catch((err) => Promise.reject(err));
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

        didServerGoOffline:     updatedStatus.isServerOnline() === false && lastKnownStatus.isServerOnline() === true,
        didGameGoOffline:       updatedStatus.isOnline() === false && lastKnownStatus.isOnline() === true,
        isServerBackOnline:     updatedStatus.isServerOnline() === true && lastKnownStatus.isServerOnline() === false,
        isGameBackOnline:       updatedStatus.isOnline() === true && lastKnownStatus.isOnline() === false,
        didGameStart:           updatedStatus.isOngoing() === true && lastKnownStatus.isInLobby() === true,
        didGameRestart:         updatedStatus.isInLobby() === true && lastKnownStatus.isOngoing() === true,
        didHourPass:            updatedStatus.getMsLeft() != null && lastKnownHourMark !== currentHourMark,
        isLastHourBeforeTurn:   lastKnownHourMark !== currentHourMark && currentHourMark === 0,
        isNewTurn:              currentTurnNumber > lastKnownTurnNumber,
        wasTurnRollbacked:      currentTurnNumber < lastKnownTurnNumber,
        lastTurnTimestamp
    };

    if (events.isNewTurn === true)
        updatedStatus.setLastTurnTimestamp(Date.now());

    return events;
}


function _handleGameEvents(game, updateData)
{
    if (game.isEnforcingTimer() === true)
        _enforceTimer(game, updateData);

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
        return _handleLastHourBeforeTurn(game);

    else if (updateData.isNewTurn === true)
        return _handleNewTurn(game, updateData);

    else if (updateData.wasTurnRollbacked === true)
        return _handleTurnRollback(game, updateData);

    // Double check that game is ongoing when checking if all turns are done, otherwise the
    // statusdump will give false positives, since all nations show up with controller 0
    else if (game.isCurrentTurnRollback() === false && updateData.isOngoing() === true)
    {
        // This check will emit an event to the slave server to verify the statusdump
        // Reason being that tcpquery data does not show dead nations and considers them
        // undone turns; so they will block new turns. Statusdump shows this info as -1 controller
        log.general(log.getVerboseLevel(), `${game.getName()}\tChecking with slave if all turns are done...`);
        return _checkIfAllTurnsAreDone(game)
        .then((areAllTurnsDone) =>
        {
            if (areAllTurnsDone === true)
            {
                log.general(log.getNormalLevel(), `${game.getName()}\tAll turns done`);
                _handleAllTurnsDone(game, updateData);
            }

            else log.general(log.getVerboseLevel(), `${game.getName()}\tSome turns are undone`);
        });
    }

    if (updateData.didHourPass === true)
        return _handleHourPassed(game, updateData);

    else if (updateData.isServerBackOnline === true)
        return _handleServerBackOnline(game);

    else if (updateData.isGameBackOnline === true)
        return _handleGameBackOnline(game);
}


function _enforceTimer(game, updateData)
{
    if (updateData.isNewTurn === true || updateData.wasTurnRollbacked === true || updateData.didGameStart === true)
    {
        log.general(log.getNormalLevel(), `Setting ${game.getName()}'s timer back to default.`);
        updateData.setMsToDefaultTimer(game);
        log.general(log.getNormalLevel(), `${game.getName()} set to ${updateData.getMsLeft()}ms.`);
    }

    else if (updateData.getMsLeft() <= 0 && updateData.isPaused() === false)
    {
        _handleAllTurnsDone(game, updateData);
    }
}

function _handleServerOffline(game)
{
    game.sendMessageToChannel(`Host server is offline. It will be back online shortly.`);
}

function _handleGameOffline(game)
{
    game.sendMessageToChannel(`Game process is offline. Use the launch command to relaunch it.`);
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

function _handleLastHourBeforeTurn(game)
{
    log.general(log.getNormalLevel(), `${game.getName()}\t~1h left for new turn.`);
    game.sendGameAnnouncement(`There is less than an hour remaining for the new turn.`);
}

function _handleNewTurn(game, updateData)
{
    log.general(log.getNormalLevel(), `${game.getName()}\tnew turn.`);

    game.sendGameAnnouncement(`Turn ${updateData.getTurnNumber()} has arrived.`);
    _processNewTurnPreferences(game, updateData.getTurnNumber());
    _processStales(game, updateData);
}

function _handleTurnRollback(game, updateData)
{
    log.general(log.getNormalLevel(), `${game.getName()}\trollbacked turn.`);
    game.sendGameAnnouncement(`The game has been rollbacked to turn ${updateData.getTurnNumber()}.`);
}

function _handleAllTurnsDone(game, updateData)
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
    game.sendMessageToChannel(`Game process is back online.`);
}


function _processNewTurnPreferences(game, turnNumber)
{
    const nationFilesToFetch = [];
    const gameName = game.getName();
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
                if (preferences.isReceivingScores() === true)
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
                    if (nationTurnData.isTurnDone === false || (nationTurnData.isTurnDone === true && preferences.isReceivingRemindersWhenTurnIsDone() === true))
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