
const log = require("../../logger.js");
const { EmbedBuilder } = require("discord.js");
const MessagePayload = require("../../discord/prototypes/message_payload.js");


module.exports = (game) =>
{   
    const status = game.getLastKnownStatus();
    const channel = game.getChannel();

    // Set according state values; including resetting the timer so it doesn't double roll
    status.setIsTurnProcessing(true);
    status.setMsToDefaultTimer(game);

    log.general(log.getNormalLevel(), `${game.getName()}: Turn started processing.`);
    new MessagePayload()
        .addEmbeds(
            new EmbedBuilder()
                .setDescription("New turn started processing. It may take a long time if other turns are processing.")
        )
        .send(channel);
};
