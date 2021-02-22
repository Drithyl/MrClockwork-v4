

const guildStore = require("../guild_store.js");
const botClientWrapper = require("../wrappers/bot_client_wrapper.js");


exports.startListening = () =>
{
    console.log("Listening to onLeftGuild.");
    botClientWrapper.addOnBotLeftGuildHandler(_onLeftGuild);
};

function _onLeftGuild(discordJsGuild)
{
    guildStore.removeGuild(discordJsGuild)
    .catch((err) => console.log(err));
}