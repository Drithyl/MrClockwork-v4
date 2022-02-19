
const log = require("../../logger.js");


module.exports = (game) =>
{
    const gameName = game.getName();
    const status = game.getLastKnownStatus();
    
    try
    {
        // Update the game's status to reflect the game having started
        status.setHasStarted(true);
        status.setLastTurnTimestamp(Date.now());
        status.setMsToDefaultTimer(game);
        status.setIsTurnProcessing(false);
        status.setIsCurrentTurnRollback(false);
        
        // Announce the game start
        game.sendGameAnnouncement(`The game has started! The turn timer is set to: ${status.printTimeLeft()}.`);

        // Log the event
        log.general(log.getNormalLevel(), `${game.getName()}\tstarted.`);
    }

    catch(err)
    {
        // Log the error
        log.error(log.getLeanLevel(), `${gameName} game started event error`, err.stack);

        // Attempt to inform players of the game start error
        game.sendGameAnnouncement(
            `The following error occurred when resolving the game started event:\n\n\`\`\`${err.message}\`\`\``
        );
    }
};