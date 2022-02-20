
const log = require("../../logger.js");


module.exports = async (game, dom5Events) =>
{
    const gameName = game.getName();
    const status = game.getLastKnownStatus();
    const turnNumber = dom5Events.getTurnNumber();

    try
    {
        // Update the game's status to reflect the new turn
        status.setLastTurnTimestamp(Date.now());
        status.setMsToDefaultTimer(game);
        status.setIsTurnProcessing(false);
        status.setIsCurrentTurnRollback(true);

        log.general(log.getNormalLevel(), `${game.getName()}\t_isCurrentRollback set to ${status.isCurrentTurnRollback()}`);

        // Log and announce the turn rollback
        log.general(log.getNormalLevel(), `${gameName}\trollbacked to turn ${turnNumber}.`);
        await game.sendGameAnnouncement(`The game has been **rollbacked to turn ${turnNumber}**. This turn will not process automatically; instead, it must be force-hosted using \`!forcehost\` once everyone is ready.`);
    }

    catch(err)
    {
        // Log the error
        log.error(log.getLeanLevel(), `${gameName} turn rollback event error`, err.stack);

        // Attempt to inform players of the new turn error
        game.sendGameAnnouncement(
            `The following error occurred when resolving the game's turn rollback event:\n\n\`\`\`${err.message}\`\`\``
        );
    }


};
