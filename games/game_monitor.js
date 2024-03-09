
const log = require("../logger.js");
const assert = require("../asserter.js");
const parseDomUpdate = require("./dominions_update.js");
const handleGameEvents = require("./handle_game_events.js");
const DominionsEvents = require("./prototypes/dominions_events.js");

const monitoredGames = [];


// Add a game to be monitored and updated
exports.monitorDomGame = (game) =>
{
    if (monitoredGames.find((g) => g.getName() === game.getName()) != null)
        return log.general(log.getLeanLevel(), `${game.getName()} is already being monitored.`);
        
    monitoredGames.push(game);
    log.general(log.getNormalLevel(), `${game.getName()} will be monitored for updates.`);
};

exports.monitorDomGames = (games) =>
{
    if (assert.isArray(games) === false)
        exports.monitorDomGame(games);

    else games.forEach((game, i) => exports.monitorDomGame(game, i * 500));
};

// Remove a game from the monitoring list
exports.stopMonitoringDomGame = (game) =>
{
    for (let i = 0; i < monitoredGames.length; i++)
    {
        if (monitoredGames[i].getName() === game.getName())
        {
            monitoredGames.splice(i, 1);
            return log.general(log.getLeanLevel(), `${game.getName()} will no longer be monitored for updates.`);
        }
    }
    
    log.general(log.getLeanLevel(), `${game.getName()} is not in the list of monitored games; no need to remove.`);
};

exports.updateDomGame = (game, updateData) =>
{
    if (monitoredGames.find((g) => g.getName() === game.getName()) == null)
        return log.general(log.getNormalLevel(), `${game.getName()} is not being monitored.`);

    try
    {
        _updateGame(game, updateData);
    }

    catch(err)
    {
        log.error(log.getLeanLevel(), `${game.getName()} encountered error while updating`, err);
    }
};


function _updateGame(game, updateData)
{
    // Get our game's last recorded status
    const gameStatus = game.getLastKnownStatus();

    // Fetch the most recent status of the game
    const newStatusSnapshot = parseDomUpdate(game, updateData);

    // Get the new ms left that the game would be at presently, taking
    // things like pauses or offline game into account
    const newMsLeft = _getUpdatedTimer(game, newStatusSnapshot);

    // Apply it first to our new snapshot of the game's status, so that
    // we can have the comparison of the before and after values
    newStatusSnapshot.setMsLeft(newMsLeft);

    // Determine all events that occurred in the time elapsed
    const domEvents = new DominionsEvents(gameStatus, newStatusSnapshot);

    // Apply the elapsed timer to the actual game status now
    gameStatus.setMsLeft(newMsLeft);

    // Update other properties of the status now that we have determined the events
    gameStatus.setPlayers(newStatusSnapshot.getPlayers());
    gameStatus.setLastUpdateTimestamp(newStatusSnapshot.getLastUpdateTimestamp());
    gameStatus.setSuccessfulCheckTimestamp(newStatusSnapshot.getSuccessfulCheckTimestamp());
    
    // Handle the game events
    handleGameEvents(game, domEvents);

    // Set the new turn number on the game status
    gameStatus.setTurnNumber(newStatusSnapshot.getTurnNumber());

    // Update game online status. This is also done in the back online and went offline
    // event scripts, but should the return of isOnline() be undefined or null, they
    // will never trigger. Thus this ensures they get properly overwritten after
    // all relevant events get processed
    gameStatus.setIsOnline(newStatusSnapshot.isOnline());

    game.save();
}


function _getUpdatedTimer(game, newStatusSnapshot)
{
    // Get our game's last recorded status
    const gameStatus = game.getLastKnownStatus();
    const elapsedTimeSinceLastUpdate = newStatusSnapshot.getUptime();


    if (newStatusSnapshot.isServerOnline() === false)
        return gameStatus.getMsLeft();

    if (newStatusSnapshot.isOnline() === false)
        return gameStatus.getMsLeft();

    if (newStatusSnapshot.hasStarted() === false)
        return gameStatus.getMsLeft();

    if (gameStatus.hasStarted() === false)
        return gameStatus.getMsLeft();

    if (gameStatus.isPaused() === true)
        return gameStatus.getMsLeft();

    if (gameStatus.isTurnProcessing() === true)
        return gameStatus.getMsLeft();

    // No timer change if uptime is not a proper integer
    if (assert.isInteger(elapsedTimeSinceLastUpdate) === false)
        return gameStatus.getMsLeft();
        
        
    // Return new timer after uptime. Once it dips into negatives, turn will be forced to roll
    return gameStatus.getMsLeft() - elapsedTimeSinceLastUpdate;
}