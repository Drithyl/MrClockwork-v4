"use strict";
var guildStore = require("./guild_store.js");
var discordEvents = require("./discord_events.js");
var botClientWrapper = require("./wrappers/bot_client_wrapper.js");
exports.startDiscordIntegration = function () {
    return botClientWrapper.loginToDiscord()
        .then(function (discordJsGuildMap) { return guildStore.populateStore(discordJsGuildMap); })
        .then(function () {
        discordEvents.startListening();
        return Promise.resolve();
    });
};
//# sourceMappingURL=discord.js.map