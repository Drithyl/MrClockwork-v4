
const guildStore = require("../guild_store.js");
const botClientWrapper = require("../wrappers/bot_client_wrapper.js");


exports.startListening = () =>
{
    console.log("Listening to onJoinedGuild.");
    botClientWrapper.addOnBotJoinedGuildHandler(_onJoinedGuild);
};

function _onJoinedGuild(discordJsGuild)
{
    guildStore.addGuild(discordJsGuild);

    //TODO: message guild owner about the deploy command
}