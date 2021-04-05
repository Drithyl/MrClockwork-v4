
const log = require("../../logger.js");
const guildStore = require("../guild_store.js");
const botClientWrapper = require("../wrappers/bot_client_wrapper.js");


exports.startListening = () =>
{
    log.general(log.getNormalLevel(), "Listening to onLeftGuild.");
    botClientWrapper.addOnBotLeftGuildHandler(_onLeftGuild);
};

function _onLeftGuild(discordJsGuild)
{
    guildStore.removeGuild(discordJsGuild)
    .catch((err) => log.error(log.getLeanLevel(), `ERROR WHEN BOT LEFT GUILD ${discordJsGuild.name}`, err));
}