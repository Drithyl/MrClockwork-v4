
const log = require("../../logger.js");


module.exports = (game) =>
{
    const status = game.getLastKnownStatus();
    status.setIsServerOnline(true);

    game.sendMessageToChannel(`Host server is online again. If the game does not go online shortly, you can relaunch it.`)
    .catch((err) =>
    {
        log.error(log.getNormalLevel(), `${game.getName()}\tError sending 'server back online' message`, err.stack);
    });
};
