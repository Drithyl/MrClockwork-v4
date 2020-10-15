"use strict";
var Discord = require("discord.js");
var config = require("../../config/config.json");
var discordJsBotClient = new Discord.Client();
exports.getId = function () { return discordJsBotClient.user.id; };
exports.loginToDiscord = function () {
    console.log("Logging into Discord...");
    return discordJsBotClient.login(config.loginToken)
        .then(function () {
        console.log("Bot logged in.");
        return Promise.resolve(discordJsBotClient.guilds.cache);
    });
};
//wrappers for discord events caught by the bot client in the DiscordJs library
exports.addOnLoggedInHandler = function (handler) { return discordJsBotClient.on("ready", function () { return handler(); }); };
exports.addOnGuildUnavailableHandler = function (handler) { return discordJsBotClient.on("guildUnavailable", function (discordJsGuild) { return handler(discordJsGuild); }); };
exports.addOnGuildDeletedHandler = function (handler) { return discordJsBotClient.on("guildBecameUnavailable", function (discordJsGuild) { return handler(discordJsGuild); }); };
exports.addOnChannelDeletedHandler = function (handler) { return discordJsBotClient.on("channelDelete", function (discordJsChannel) { return handler(discordJsChannel); }); };
exports.addOnMessageReceivedHandler = function (handler) { return discordJsBotClient.on("message", function (discordJsMessage) { return handler(discordJsMessage); }); };
exports.addOnMessageDeletedHandler = function (handler) { return discordJsBotClient.on("messageDelete", function (discordJsMessage) { return handler(discordJsMessage); }); };
exports.addOnBotDisconnectedHandler = function (handler) { return discordJsBotClient.on("disconnect", function () { return handler(); }); };
exports.addOnBotReconnectingHandler = function (handler) { return discordJsBotClient.on("reconnecting", function () { return handler(); }); };
exports.addOnDebugInfoHandler = function (handler) { return discordJsBotClient.on("debug", function (info) { return handler(info); }); };
exports.addOnWarningHandler = function (handler) { return discordJsBotClient.on("warn", function (warning) { return handler(warning); }); };
exports.addOnBotErrorHandler = function (handler) { return discordJsBotClient.on("error", function (error) { return handler(error); }); };
exports.addOnBotJoinedGuildHandler = function (handler) {
    discordJsBotClient.on("guildCreate", function onGuildCreate(discordJsGuild) {
        //if guild is not on the bot's list, this event triggered because the bot joined a guild
        if (discordJsBotClient.hasGuild(discordJsGuild.id) === false)
            handler(discordJsGuild);
    });
};
exports.addGuildBecameAvailableHandler = function (handler) {
    discordJsBotClient.on("guildCreate", function onGuildBecameAvailable(discordJsGuild) {
        //if guild is already on the bot's list, this event triggered because it became available again
        if (discordJsBotClient.hasGuild(discordJsGuild.id) === true)
            handler(discordJsGuild);
    });
};
//# sourceMappingURL=bot_client_wrapper.js.map