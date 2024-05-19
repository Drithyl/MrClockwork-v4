
const log = require("../../logger.js");
const { EmbedBuilder } = require("discord.js");
const MessagePayload = require("../../discord/prototypes/message_payload.js");


module.exports = (game, turnNumber, error) =>
{
    const channel = game.getChannel();

    if (error)
    {
        log.error(log.getLeanLevel(), `${game.getName()}: Pre-turn backup encountered error.`, error);

        new MessagePayload()
            .addEmbeds(
                new EmbedBuilder()
                    .setColor(0xff0404)
                    .setDescription(`**__Pre-turn backup encountered an error__**. Rollback to previous turn might not be available.\n\`\`\`     ${error}\`\`\``)
            )
            .send(channel);
    }

    else
    {
        log.general(log.getNormalLevel(), `${game.getName()}: Pre-turn ${turnNumber} backup finished!`);
        new MessagePayload()
            .addEmbeds(
                new EmbedBuilder()
                    .setColor(0x80cd21)
                    .setDescription("Pre-turn backup successful.")
            )
            .send(channel);
    }
};
