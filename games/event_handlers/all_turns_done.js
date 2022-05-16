
const log = require("../../logger.js");


module.exports = (game) =>
{
    const gameName = game.getName();
    const status = game.getLastKnownStatus();

    if (status.isCurrentTurnRollback() === true || 
        status.isTurnProcessing() === true ||
        status.isPaused() === true)
        return;

    log.general(log.getLeanLevel(), `${gameName}\t All turns are done!`);

    // Set the timer back to default immediately so that no double turns occur easily
    status.setMsToDefaultTimer(game);
};
