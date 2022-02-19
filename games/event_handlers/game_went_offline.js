
const log = require("../../logger.js");


module.exports = (game) =>
{
    const status = game.getLastKnownStatus();
    status.setIsOnline(false);

    game.sendMessageToChannel(`Game process is offline. Use the launch command to relaunch it.`)
    .catch((err) =>
    {
        log.error(log.getNormalLevel(), `${game.getName()}\tError sending 'game went offline' message`, err.stack);
    });
};
