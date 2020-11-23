
const dominions5TcpQuery = require("./prototypes/dominions5_tcp_query.js");

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
                _updateDom5Game(game)
        })
        .catch((err) => 
        {
            console.log(`${gameName}\t${err.message}`);
            
            if (monitoredGames[gameName] != null)
                _updateDom5Game(game)
        });

    }, UPDATE_INTERVAL);
}

function _updateCycle(game)
{
    var updateData;

    const gameName = game.getName();

    console.log(`${gameName}\tupdating...`);

    return dominions5TcpQuery(game)
    .then((tcpQuery) =>
    {
        game.updateStatusEmbed(tcpQuery);

        if (tcpQuery.isServerOnline() === false)
            return Promise.reject(new Error(`${gameName}\tserver offline; cannot update.`));

        if (tcpQuery.isOnline() === false)
            return Promise.reject(new Error(`${gameName}\toffline; cannot update.`));

        updateData = game.update(tcpQuery);

        console.log(`${gameName}\treceived updated data:\n
        \tcurrentStatus:\t\t${updateData.currentStatus}
        \tcurrentMsLeft:\t\t${updateData.currentMsLeft}
        \tcurrentTurnNumber:\t${updateData.currentTurnNumber}
        \tlastKnownStatus:\t${updateData.lastKnownStatus}
        \tlastKnownMsLeft:\t${updateData.lastKnownMsLeft}
        \tlastKnownTurnNumber:\t${updateData.lastKnownTurnNumber}`);

        return _announceStatusChanges(game, updateData);
    })
    .then(() => game.save())
    .catch((err) => Promise.reject(err));
}

function _announceStatusChanges(game, updateData)
{
    const gameName = game.getName();
    const currentStatus = updateData.currentStatus;
    const currentTurnNumber = updateData.currentTurnNumber;

    const lastKnownStatus = updateData.lastKnownStatus;
    const lastKnownTurnNumber = updateData.lastKnownTurnNumber;

    if (_didServerGoOffline(currentStatus, lastKnownStatus) === true)
        return game.sendMessageToChannel(`Host server is offline. It will be back online shortly.`);

    else if (_didGameGoOffline(currentStatus, lastKnownStatus) === true)
        return game.sendMessageToChannel(`Game process is offline. Use the launch command to relaunch it.`);

    else if (_didGameStart(currentStatus, lastKnownStatus) === true)
    {
        console.log(`${gameName}\tstarted.`);
        return game.sendGameAnnouncement(`The game has started!`);
    }

    else if (_didGameRestart(currentStatus, lastKnownStatus) === true)
    {
        console.log(`${gameName}\trestarted.`);
        return game.sendGameAnnouncement(`The game has restarted; please submit your pretenders!`);
    }

    else if (_isNewTurn(currentTurnNumber, lastKnownTurnNumber) === true)
    {
        console.log(`${gameName}\tnew turn.`);
        return game.sendGameAnnouncement(`Turn ${currentTurnNumber} has arrived.`);
    }

    else if (_isRollbackTurn(currentTurnNumber, lastKnownTurnNumber) === true)
    {
        console.log(`${gameName}\trollbacked turn.`);
        return game.sendGameAnnouncement(`The game has been rollbacked to turn ${currentTurnNumber}.`);
    }

    else if (_isServerBackOnline(currentStatus, lastKnownStatus) === true)
        return game.sendMessageToChannel(`Host server is online again. If the game does not go online shortly, you can relaunch it.`);

    else if (_isGameBackOnline(currentStatus, lastKnownStatus) === true)
        return game.sendMessageToChannel(`Game process is back online.`);

    else return Promise.resolve();
}

function _didServerGoOffline(currentStatus, lastKnownStatus)
{
    return currentStatus === SERVER_OFFLINE && lastKnownStatus !== SERVER_OFFLINE;
}

function _didGameGoOffline(currentStatus, lastKnownStatus)
{
    return currentStatus === GAME_OFFLINE && lastKnownStatus !== GAME_OFFLINE;
}

function _didGameStart(currentStatus, lastKnownStatus)
{
    return currentStatus === STARTED && lastKnownStatus === IN_LOBBY;
}

function _didGameRestart(currentStatus, lastKnownStatus)
{
    return currentStatus === IN_LOBBY && lastKnownStatus === STARTED;
}

function _isNewTurn(currentTurnNumber, lastKnownTurnNumber)
{
    return currentTurnNumber > lastKnownTurnNumber;
}

function _isRollbackTurn(currentTurnNumber, lastKnownTurnNumber)
{
    return currentTurnNumber < lastKnownTurnNumber;
}

function _isServerBackOnline(currentStatus, lastKnownStatus)
{
    return currentStatus !== SERVER_OFFLINE && lastKnownStatus === SERVER_OFFLINE;
}

function _isGameBackOnline(currentStatus, lastKnownStatus)
{
    return currentStatus !== GAME_OFFLINE && lastKnownStatus === GAME_OFFLINE;
}