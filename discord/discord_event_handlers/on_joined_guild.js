
const log = require("../../logger.js");
const guildStore = require("../guild_store.js");
const config = require("../../config/config.json");
const guildPatcher = require("../../patcher/guild_patcher.js");
const MessagePayload = require("../prototypes/message_payload.js");
const botClientWrapper = require("../wrappers/bot_client_wrapper.js");


exports.startListening = () =>
{
    log.general(log.getNormalLevel(), "Listening to onJoinedGuild.");
    botClientWrapper.addOnBotJoinedGuildHandler(_onJoinedGuild);
};

function _onJoinedGuild(discordJsGuild)
{
    const guildWrapper = guildStore.addGuild(discordJsGuild);

    // Try to import guild data from the v3 bot
    guildPatcher();

    guildWrapper.fetchOwner()
    .then((ownerWrapper) => ownerWrapper.sendMessage(new MessagePayload(
        `Thank you for using this bot. To get started, you must ensure I have permissions to manage channels and roles, and then use the command \`${config.prefix}deploy\` in any of the guild's channels which the bot can see. It will create a few necessary roles and categories.`
    )));
}