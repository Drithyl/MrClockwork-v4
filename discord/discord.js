
const guildStore = require("./guild_store.js");
const discordEvents = require("./discord_events.js");
const botClientWrapper = require("./wrappers/bot_client_wrapper.js");

exports.startDiscordIntegration = () =>
{
    return botClientWrapper.loginToDiscord()
    .then((discordJsGuildMap) => guildStore.populateStore(discordJsGuildMap))
    .then(() =>
    {
        discordEvents.startListening();
        return Promise.resolve();
    });
};