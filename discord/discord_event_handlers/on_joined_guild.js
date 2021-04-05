
const log = require("../../logger.js");
const guildStore = require("../guild_store.js");
const botClientWrapper = require("../wrappers/bot_client_wrapper.js");


exports.startListening = () =>
{
    log.general(log.getNormalLevel(), "Listening to onJoinedGuild.");
    botClientWrapper.addOnBotJoinedGuildHandler(_onJoinedGuild);
};

function _onJoinedGuild(discordJsGuild)
{
    guildStore.addGuild(discordJsGuild);

    //TODO: message guild owner about the deploy command
}