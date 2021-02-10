
const dominions5TcpQuery = require("./prototypes/dominions5_tcp_query.js");
const botClientWrapper = require("../discord/wrappers/bot_client_wrapper.js");

const UPDATE_INTERVAL = 10000;
const IN_LOBBY = "Game is being setup";
const STARTED = "Game is active";
const SERVER_OFFLINE = "Host server offline";
const GAME_OFFLINE = "Game offline";

var monitoredGames = {};

exports.monitorDom5Game = (game) =>
{
    _updateDom5Game(game);
    monitoredGames[game.getName()] = true;
};

exports.stopMonitoringDom5Game = (game) =>
{
    delete monitoredGames[game.getName()];
};

function _updateDom5Game(game)
{
    const gameName = game.getName();

    setTimeout(() => 
    {
        return _updateCycle(game)
        .then(() => 
        {
            if (monitoredGames[gameName] != null)
                _updateDom5Game(game);
        })
        .catch((err) => 
        {
            console.log(`${gameName}\t${err.message}`);
            
            if (monitoredGames[gameName] != null)
                _updateDom5Game(game);
        });

    }, UPDATE_INTERVAL);
}

function _updateCycle(game)
{
    const lastKnownData = game.getLastKnownData();

    //console.log(`${gameName}\tupdating...`);

    return dominions5TcpQuery(game)
    .then((tcpQuery) =>
    {
        const updateData = Object.assign(tcpQuery, _getTcpQueryEvents(tcpQuery, lastKnownData));
        game.updateStatusEmbed(updateData);

        if (tcpQuery.isServerOnline() === false)
            //return Promise.reject(new Error(`${gameName}\tserver offline; cannot update.`));
            return Promise.resolve();

        else if (tcpQuery.isOnline() === false)
            //return Promise.reject(new Error(`${gameName}\toffline; cannot update.`));
            return Promise.resolve();

        game.update(updateData);

        /*console.log(`${gameName}\treceived updated data:\n
        \tcurrentStatus:\t\t${updateData.status}
        \tcurrentMsLeft:\t\t${updateData.msLeft}
        \tcurrentTurnNumber:\t${updateData.turnNumber}
        \tlastKnownStatus:\t${updateData.lastKnownStatus}
        \tlastKnownMsLeft:\t${updateData.lastKnownMsLeft}
        \tlastKnownTurnNumber:\t${updateData.lastKnownTurnNumber}`);*/

        return _announceEvents(game, updateData)
        .then(() => _processPlayerPreferences(game, updateData));
    })
    .then(() => game.save())
    .catch((err) => Promise.reject(err));
}

function _getTcpQueryEvents(tcpQuery, lastKnownData)
{
    const currentStatus = tcpQuery.status;
    const currentTurnNumber = tcpQuery.turnNumber;

    const { lastKnownMsLeft, 
            lastKnownStatus, 
            lastTurnTimestamp, 
            lastKnownTurnNumber } = lastKnownData;
            
    const lastKnownHourMark = Math.floor(lastKnownMsLeft / 1000 / 3600);
    const currentHourMark = Math.floor(tcpQuery.msLeft / 1000 / 3600);

    const events = {

        didServerGoOffline: currentStatus === SERVER_OFFLINE && lastKnownStatus !== SERVER_OFFLINE,
        didGameGoOffline:   currentStatus === GAME_OFFLINE && lastKnownStatus !== GAME_OFFLINE,
        isServerBackOnline: currentStatus !== SERVER_OFFLINE && lastKnownStatus === SERVER_OFFLINE,
        isGameBackOnline:   currentStatus !== GAME_OFFLINE && lastKnownStatus === GAME_OFFLINE,
        didGameStart:       currentStatus === STARTED && lastKnownStatus === IN_LOBBY,
        didGameRestart:     currentStatus === IN_LOBBY && lastKnownStatus === STARTED,
        didHourPass:        lastKnownHourMark !== currentHourMark,
        isNewTurn:          currentTurnNumber > lastKnownTurnNumber,
        wasTurnRollbacked:  currentTurnNumber < lastKnownTurnNumber,
        lastTurnTimestamp,
        lastKnownStatus,
        lastKnownTurnNumber,
        lastKnownMsLeft
    };

    if (events.isNewTurn === true)
        events.lastTurnTimestamp = Date.now();

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
        console.log(`${gameName}\tstarted.`);
        return game.sendGameAnnouncement(`The game has started!`);
    }

    else if (updateData.didGameRestart === true)
    {
        console.log(`${gameName}\trestarted.`);
        return game.sendGameAnnouncement(`The game has restarted; please submit your pretenders!`);
    }

    else if (updateData.isNewTurn === true)
    {
        console.log(`${gameName}\tnew turn.`);
        return game.sendGameAnnouncement(`Turn ${updateData.turnNumber} has arrived.`);
    }

    else if (updateData.wasTurnRollbacked === true)
    {
        console.log(`${gameName}\trollbacked turn.`);
        return game.sendGameAnnouncement(`The game has been rollbacked to turn ${updateData.turnNumber}.`);
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
        _processNewTurnPreferences(game, updateData.turnNumber);

    else if (updateData.didHourPass === true)
    {
        const hourMarkPassed = Math.ceil(updateData.msLeft / 1000 / 3600);
        _processNewHourPreferences(game, updateData.players, hourMarkPassed);
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
            .catch((err) => console.log(`Could not send nation backups to user: ${err.message}\n\n${err.stack}`));
        });
    })
    .catch((err) => console.log(`Could not fetch nation files from server: ${err.message}\n\n${err.stack}`));
}

function _processNewHourPreferences(game, playerTurnData, hourMarkPassed)
{
    const gameName = game.getName();
    console.log(playerTurnData);

    game.forEachPlayerFile((file) =>
    {
        const preferences = file.getEffectiveGamePreferences(gameName);
        const controlledNationsByFullName = file.getControlledNationsInGame(gameName).map((nationObject) => nationObject.getFullName());
        
        if (preferences.hasReminderAtHourMark(hourMarkPassed) === true)
        {
            console.log("Has reminder set");
            for (var i = 0; i < controlledNationsByFullName.length; i++)
            {
                const nationFullName = controlledNationsByFullName[i];
                const nationTurnData = playerTurnData.find((nationData) => nationData.name.toLowerCase() === nationFullName.toLowerCase());
                
                console.log("Checking for ", nationFullName);

                if (nationTurnData != null)
                {
                    if (nationTurnData.isTurnDone === false || (nationTurnData.isTurnDone === true && preferences.isReceivingRemindersWhenTurnIsDone() === true))
                    {
                        botClientWrapper.fetchUser(file.getId())
                        .then((userWrapper) => userWrapper.sendMessage(`There are less than ${hourMarkPassed} hours left for the next turn in ${gameName}.`))
                        .catch((err) => console.log(`Could not send nation backups to user: ${err.message}\n\n${err.stack}`));
    
                        break;
                    }
                }
            }
        }
    });
}