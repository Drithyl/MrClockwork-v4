
const log = require("../../logger.js");


module.exports = (game) =>
{   
    const status = game.getLastKnownStatus();

    // Set according state values; including resetting the timer so it doesn't double roll
    status.setIsTurnProcessing(true);
    status.setMsToDefaultTimer(game);

    log.general(log.getNormalLevel(), `${game.getName()}: Turn started processing.`);
    game.sendMessageToChannel(`New turn started processing. It may take a long time if other turns are processing.`);
};
