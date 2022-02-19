
const log = require("../../logger.js");


module.exports = (game) =>
{
    const status = game.getLastKnownStatus();
    status.setIsOnline(true);

    game.sendMessageToChannel(`Game process is back online.`)
    .catch((err) =>
    {
        log.error(log.getNormalLevel(), `${game.getName()}\tError sending 'game back online' message`, err.stack);
    });
};
