
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
            
        if (game.isEnforcingTimer() === true)
            _handleUpdatedStatus(game, updateData);


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

        game.update(updateData);

        return _announceEvents(game, updateData)
        .then(() => _processPlayerPreferences(game, updateData));
    })
    .then(() => game.save())
    .catch((err) => Promise.reject(err));
}

function _handleUpdatedStatus(game, updatedData)
{
    if (updatedData.isNewTurn === true || updatedData.didGameStart === true)
    {
        const timerSetting = game.getSettingsObject().getTimerSetting();
        const timePerTurnObject = timerSetting.getValue();
        const msPerTurn = timePerTurnObject.getMsLeft();
        
        updatedData.setMsLeft(msPerTurn);
    }

    else if (updatedData.getMsLeft() <= 0 && updatedData.isPaused() === false)
        game.forceHost();
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

        didServerGoOffline: updatedStatus.isServerOnline() === false && lastKnownStatus.isServerOnline() === true,
        didGameGoOffline:   updatedStatus.isOnline() === false && lastKnownStatus.isOnline === true,
        isServerBackOnline: updatedStatus.isServerOnline() === true && lastKnownStatus.isServerOnline() === false,
        isGameBackOnline:   updatedStatus.isOnline() === true && lastKnownStatus.isOnline() === false,
        didGameStart:       updatedStatus.isOngoing() === true && lastKnownStatus.isInLobby() === true,
        didGameRestart:     updatedStatus.isInLobby() === true && lastKnownStatus.isOngoing() === true,
        didHourPass:        lastKnownHourMark !== currentHourMark,
        isNewTurn:          currentTurnNumber > lastKnownTurnNumber,
        wasTurnRollbacked:  currentTurnNumber < lastKnownTurnNumber,
        lastTurnTimestamp
    };

    if (events.isNewTurn === true)
        updatedStatus.setLastTurnTimestamp(Date.now());

    return events;
}

function _announceEvents(game, updateData)
{
    const gameName = game.getName();

    /** Order of conditionals matters! A new turn or a restart must be caught before
     *  the server or the game coming back online, as those will only trigger once
     */

    if (updateData.didServerGoOffline === true)
        return game.sendMessageToChannel(`Host server is offline. It will be back online shortly.`);

    else if (updateData.didGameGoOffline === true)
        return game.sendMessageToChannel(`Game process is offline. Use the launch command to relaunch it.`);

    else if (updateData.didGameStart === true)
    {
        log.general(log.getNormalLevel(), `${gameName}\tstarted.`);
        return game.sendGameAnnouncement(`The game has started!`);
    }

    else if (updateData.didGameRestart === true)
    {
        log.general(log.getNormalLevel(), `${gameName}\trestarted.`);
        return game.sendGameAnnouncement(`The game has restarted; please submit your pretenders!`);
    }

    else if (updateData.isNewTurn === true)
    {
        log.general(log.getNormalLevel(), `${gameName}\tnew turn.`);
        return game.sendGameAnnouncement(`Turn ${updateData.getTurnNumber()} has arrived.`);
    }

    else if (updateData.wasTurnRollbacked === true)
    {
        log.general(log.getNormalLevel(), `${gameName}\trollbacked turn.`);
        return game.sendGameAnnouncement(`The game has been rollbacked to turn ${updateData.getTurnNumber()}.`);
    }

    else if (updateData.isServerBackOnline === true)
        return game.sendMessageToChannel(`Host server is online again. If the game does not go online shortly, you can relaunch it.`);

    else if (updateData.isGameBackOnline === true)
        return game.sendMessageToChannel(`Game process is back online.`);

    else return Promise.resolve();
}

function _processPlayerPreferences(game, updateData)
{
    if (updateData.isNewTurn === true)
        _processNewTurnPreferences(game, updateData.getTurnNumber());

    else if (updateData.didHourPass === true)
    {
        const hourMarkPassed = Math.ceil(updateData.getMsLeft() / 1000 / 3600);
        _processNewHourPreferences(game, updateData.getPlayers(), hourMarkPassed);
    }

    return Promise.resolve();
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