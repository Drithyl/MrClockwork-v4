
const log = require("../../logger.js");


module.exports = (game) =>
{
    const gameName = game.getName();
    const status = game.getLastKnownStatus();

    log.general(log.getLeanLevel(), `${gameName}\t Timer ran out! Forcing turn to roll...`);
    status.setIsTurnProcessing(true);
    game.forceHost();

    // Set the timer back to default immediately so that this event doesn't trigger again
    status.setMsToDefaultTimer(game);
};
