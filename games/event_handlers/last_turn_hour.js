
const log = require("../../logger.js");
const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { EMBED_COLOURS, LAST_HOUR_ICON } = require("../../constants/discord-constants.js");
const { dateToUnixTimestamp, unixTimestampToDynamicDisplay } = require("../../utilities/formatting-utilities.js");
const MessagePayload = require("../../discord/prototypes/message_payload.js");


module.exports = async (game) =>
{
    const gameName = game.getName();
    const status = game.getLastKnownStatus();
    const timeLeft = status.getTimeLeft();
    const dateWhenTurnWillRoll = timeLeft.toDateObject();
    const unixTimestamp = dateToUnixTimestamp(dateWhenTurnWillRoll);
    const uncheckedTurns = status.getUncheckedTurns();
    const mainEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOURS.WARNING)
        .setAuthor({ name: `LESS THAN ONE HOUR REMAINING`, iconURL: `${config.fullSecureUrl}/img/dominions/${LAST_HOUR_ICON}`})
        .setDescription(`The turn will roll on ${unixTimestampToDynamicDisplay(unixTimestamp)}.`);


    try
    {
        log.general(log.getNormalLevel(), `${gameName}\t~1h left for new turn.`);
        
        if (uncheckedTurns.length <= 0) {
            await game.sendGameAnnouncement(new MessagePayload().addEmbeds(mainEmbed));
        }

        else {
            await game.sendGameAnnouncement(new MessagePayload().addEmbeds([
                mainEmbed,
                new EmbedBuilder()
                    .setColor(EMBED_COLOURS.ERROR)
                    .setAuthor({ name: `Unchecked Turns` })
                    .setDescription(uncheckedTurns.join("\n"))
            ]));
        }
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
