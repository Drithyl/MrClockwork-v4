
const log = require("../../logger.js");


module.exports = (game) =>
{
    const gameName = game.getName();
    const status = game.getLastKnownStatus();
    
    try
    {
        // Update the game's status to reflect the game having just been created
        status.setHasStarted(false);
        status.setIsTurnProcessing(false);
        status.setIsCurrentTurnRollback(false);
        
        // Pin the game's settings to the channel
        game.pinSettingsToChannel();

        // Log the event
        log.general(log.getNormalLevel(), `${game.getName()}\tstarted.`);
    }

    catch(err)
    {
        // Log the error
        log.error(log.getLeanLevel(), `${gameName} game created event error`, err.stack);
    }
};