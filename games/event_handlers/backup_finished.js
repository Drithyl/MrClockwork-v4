
const log = require("../../logger.js");


module.exports = (game, data) =>
{
    if (data.preexec)
        _notifyOfPreBackup(game, data.turnNumber, data.error);

    else if (data.postexec)
        _notifyOfPostBackup(game, data.turnNumber, data.error);
};

function _notifyOfPreBackup(game, turnNumber, error)
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
}

function _notifyOfPostBackup(game, turnNumber, error)
{
    if (error)
    {
        log.error(log.getLeanLevel(), `${game.getName()}: Post-turn backup encountered error`, error);
        game.sendMessageToChannel(`Post-turn backup encountered the error below. If the next pre-turn backup fails, rollback to this turn might not be available.\n\n    ${error}`);
    }

    else
    {
        log.general(log.getNormalLevel(), `${game.getName()}: Post-turn ${turnNumber} backup finished!`);
        game.sendMessageToChannel(`Post-turn backup successful.`);
    }
}
