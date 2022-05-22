
const log = require("../../logger.js");


module.exports = (game) =>
{
    const status = game.getLastKnownStatus();

    // Set according state values; including resetting the timer so it doesn't double roll
    status.setIsTurnProcessing(false);
    status.setHasStarted(true);
    status.setMsToDefaultTimer(game);
    status.setIsCurrentTurnRollback(false);

    log.general(log.getNormalLevel(), `${game.getName()}: Turn finished processing.`);
    game.sendMessageToChannel(`New turn finished processing. The announcement should follow shortly.`);
};
