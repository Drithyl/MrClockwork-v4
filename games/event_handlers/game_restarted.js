
const log = require("../../logger.js");


module.exports = (game) =>
{
    const gameName = game.getName();
    const status = game.getLastKnownStatus();
    
    try
    {
        // Update the game's status to reflect the game having started
        status.setHasStarted(false);
        status.setTurnNumber(-1);
        status.setLastTurnTimestamp(Date.now());
        status.setMsToDefaultTimer(game);
        status.setIsTurnProcessing(false);
        status.setIsCurrentTurnRollback(false);
        
        // Announce the game start
        game.sendGameAnnouncement(`The game has restarted!`);

        // Log the event
        log.general(log.getNormalLevel(), `${game.getName()}\t got restarted.`);
    }

    catch(err)
    {
        // Log the error
        log.error(log.getLeanLevel(), `${gameName} game restarted event error`, err.stack);

        // Attempt to inform players of the game start error
        game.sendGameAnnouncement(
            `The following error occurred when resolving the game restarted event:\n\n\`\`\`${err.message}\`\`\``
        );
    }
};