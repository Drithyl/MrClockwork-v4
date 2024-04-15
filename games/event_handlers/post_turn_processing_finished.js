
const log = require("../../logger.js");


module.exports = async (game, statusdump, error) =>
{
    const status = game.getLastKnownStatus();
    let announcementText = "";

    // Update the game's status to reflect the new turn
    status.setHasStarted(true);
    status.setLastTurnTimestamp(Date.now());
    status.setMsToDefaultTimer(game);
    status.setIsTurnProcessing(false);
    status.setIsCurrentTurnRollback(false);

    announcementText += _processBackup(game, statusdump, error);

    if (error == null && statusdump != null) {
        announcementText += "\n\n" + _processStaleData(statusdump);
    }

    await game.sendMessageToChannel(announcementText);
};

function _processBackup(game, statusdump, error)
{
    const gameName = game.getName();

    if (error)
    {
        log.error(log.getLeanLevel(), `${gameName}: Post-turn backup encountered error`, error);
        return `**__Post-turn backup encountered an error__**. If the next pre-turn backup fails, rollback to this turn might not be available. Stale data won't be available for this turn either.\n\n\`\`\`     ${error}\`\`\``;
    }

    log.general(log.getNormalLevel(), `${gameName}: Post-turn ${statusdump.turnNumber} backup finished!`);
    return `Post-turn backup successful.`;
}

function _processStaleData(statusdump)
{
    const nationStatuses = statusdump.nationStatuses;
    const stales = _calculateStales(nationStatuses);
    const formattedStaleData = _formatStaleDataIntoString(stales);
    return `__**Stales this turn:**__\n\n${formattedStaleData}`;
}

function _calculateStales(nationStatuses = [])
{
    const stales = nationStatuses.filter((s) => {
        return s.isHuman === true && s.wasTurnChecked === false;
    });

    return stales;
}

function _formatStaleDataIntoString(stales = [])
{
    if (stales.length === 0)
        return "No nation staled";

    return stales.map((s) => s.fullName).join("\n").toBox();
}