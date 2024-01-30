
const log = require("../../logger.js");


module.exports = (game, turnNumber, error) =>
{
    if (error)
    {
        log.error(log.getLeanLevel(), `${game.getName()}: Pre-turn backup encountered error.`, error);
        game.sendMessageToChannel(`Pre-turn backup encountered the error below. Rollback to previous turn might not be available.\n\n    ${error}`);
    }

    else
    {
        log.general(log.getNormalLevel(), `${game.getName()}: Pre-turn ${turnNumber} backup finished!`);
        game.sendMessageToChannel(`Pre-turn backup successful.`);
    }
};
