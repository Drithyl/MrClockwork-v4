
const log = require("../../logger.js");


module.exports = async (game) =>
{
    const gameName = game.getName();
    const status = game.getLastKnownStatus();
    const uncheckedTurns = status.getUncheckedTurns();
    const announcementStr = `There is less than an hour remaining for the new turn.`;


    try
    {
        log.general(log.getNormalLevel(), `${gameName}\t~1h left for new turn.`);
        
        if (uncheckedTurns.length <= 0)
            await game.sendGameAnnouncement(announcementStr);

        else await game.sendGameAnnouncement(announcementStr + ` The following turns have not been checked at all by their players yet:\n\n${uncheckedTurns.join("\n").toBox()}`);
    }

    catch(err)
    {
        // Log the error
        log.error(log.getLeanLevel(), `${gameName} last turn hour event error`, err.stack);

        // Attempt to inform players of the new turn error
        game.sendGameAnnouncement(
            `The following error occurred when resolving the game's last turn hour event:\n\n\`\`\`${err.message}\`\`\``
        );
    }
};
