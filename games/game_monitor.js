
const log = require("../logger.js");
const ongoingGameStore = require("./ongoing_games_store.js");
const botClientWrapper = require("../discord/wrappers/bot_client_wrapper.js");
const { queryDominions5Game } = require("./prototypes/dominions5_status.js");

const UPDATE_INTERVAL = 10000;

var monitoredGames = {};

exports.monitorDom5Game = (game) =>
{
    monitoredGames[game.getName()] = true;
    log.general(log.getNormalLevel(), `${game.getName()} will be monitored for updates.`);
    _updateDom5Game(game);
};

exports.stopMonitoringDom5Game = (game) =>
{
    delete monitoredGames[game.getName()];
    log.general(log.getLeanLevel(), `${game.getName()} will no longer be monitored for updates.`);
};

function _updateDom5Game(game)
{
    const gameName = game.getName();

    setTimeout(() => 
    {
        return _updateCycle(game)
        .then(() => 
        {
            if (ongoingGameStore.hasOngoingGameByName(gameName) === false)
                delete monitoredGames[gameName];

            if (monitoredGames[gameName] != null)
                _updateDom5Game(game);
        })
        .catch((err) => 
        {
            log.error(log.getNormalLevel(), `ERROR UPDATING DOM5 GAME ${gameName}`, err);
            
            if (monitoredGames[gameName] != null)
                _updateDom5Game(game);
        });

    }, UPDATE_INTERVAL);
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
        //log.general(log.getVerboseLevel(), `${game.getName()}\tquery results received.`);
        if (game.isEnforcingTimer() === false)
            return Promise.resolve(updatedStatus);

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
    else if (game.isCurrentTurnRollback() === false && updatedStatus.isOngoing() === true)
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
        const timerSetting = game.getSettingsObject().getTimerSetting();
        const timePerTurnObject = timerSetting.getValue();
        const msPerTurn = timePerTurnObject.getMsLeft();
        
        log.general(log.getNormalLevel(), `Setting ${game.getName()}'s timer back to default: ${msPerTurn}ms`);
        updateData.setMsLeft(msPerTurn);
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

    game.forEachPlayerFile((file) =>
    {
        const preferences = file.getEffectiveGamePreferences(gameName);
        
        if (preferences.isReceivingBackups() === true)
        {
            const controlledNations = file.getControlledNationsInGame(gameName).map((nationObject) => nationObject.getFilename());

            nationFilesToFetch.push( ...controlledNations );
            filesRequestingBackups.push(file);
        }
    });

    if (filesRequestingBackups.length <= 0)
        return;

    game.emitPromiseWithGameDataToServer("GET_TURN_FILES", { nationNames: nationFilesToFetch })
    .then((files) =>
    {
        const scoresFile = files.scores;
        const nationTurnFiles = files.turnFiles;

        filesRequestingBackups.forEach((file) =>
        {
            const controlledNations = file.getControlledNationsInGame(gameName).map((nationObject) => nationObject.getFilename());

            botClientWrapper.fetchUser(file.getId())
            .then((userWrapper) =>
            {
                const files = [{ name: "scores.html", attachment: scoresFile }];

                controlledNations.forEach((nationFilename) =>
                {
                    if (nationTurnFiles[nationFilename] != null)
                        files.push({ name: `${nationFilename}.trn`, attachment: nationTurnFiles[nationFilename] });
                });

                return userWrapper.sendMessage(`Find below your nation files for turn ${turnNumber}.`, { files });
            })
            .catch((err) => log.error(log.getNormalLevel(), `ERROR SENDING NATION BACKUPS TO USER ${userWrapper.getUsername()} (${userWrapper.getId()})`, err));
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
        const controlledNationsByFullName = file.getControlledNationsInGame(gameName).map((nationObject) => nationObject.getFullName());
        
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
                            return _userWrapper.sendMessage(`There are less than ${hourMarkPassed} hours left for the next turn in ${gameName}.`);
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