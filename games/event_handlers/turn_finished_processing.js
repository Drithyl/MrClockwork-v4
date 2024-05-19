
const log = require("../../logger.js");
const { EmbedBuilder } = require("discord.js");
const MessagePayload = require("../../discord/prototypes/message_payload.js");


module.exports = (game) =>
{
    const status = game.getLastKnownStatus();
    const channel = game.getChannel();

    // Set according state values; including resetting the timer so it doesn't double roll
    status.setIsTurnProcessing(false);
    status.setHasStarted(true);
    status.setMsToDefaultTimer(game);
    status.setIsCurrentTurnRollback(false);

    log.general(log.getNormalLevel(), `${game.getName()}: Turn finished processing.`);
    new MessagePayload()
        .addEmbeds(
            new EmbedBuilder()
                .setDescription("New turn finished processing. The announcement should follow shortly.")
        )
        .send(channel);
};
