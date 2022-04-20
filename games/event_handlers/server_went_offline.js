
const log = require("../../logger.js");


module.exports = (game) =>
{
    const status = game.getLastKnownStatus();
    status.setIsServerOnline(false);

    //game.sendMessageToChannel(`Host server is offline. It will be back online shortly.`)
    //.catch((err) =>
    //{
    //    log.error(log.getNormalLevel(), `${game.getName()}\tError sending 'server went offline' message`, err.stack);
    //});
};
