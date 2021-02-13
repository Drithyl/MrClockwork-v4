
const Discord = require("discord.js");
const guildStore = require("../guild_store.js");
const UserWrapper = require("./user_wrapper.js");
const config = require("../../config/config.json");

const _discordJsBotClient = new Discord.Client();


exports.getId = () => _discordJsBotClient.user.id;

exports.loginToDiscord = () => 
{
    console.log("Logging into Discord...");
    return _discordJsBotClient.login(config.loginToken)
    .then(() => 
    {
        console.log("Bot logged in.");
        return Promise.resolve(_discordJsBotClient.guilds.cache);
    });
};

//wrappers for discord events caught by the bot client in the DiscordJs library
exports.addOnLoggedInHandler = (handler) => _discordJsBotClient.on("ready", () => handler());

exports.addOnGuildUnavailableHandler = (handler) => _discordJsBotClient.on("guildUnavailable", (discordJsGuild) => handler(discordJsGuild));
exports.addOnGuildDeletedHandler = (handler) => _discordJsBotClient.on("guildBecameUnavailable", (discordJsGuild) => handler(discordJsGuild));

exports.addOnChannelDeletedHandler = (handler) => _discordJsBotClient.on("channelDelete", (discordJsChannel) => handler(discordJsChannel));
exports.addOnRoleDeletedHandler = (handler) => _discordJsBotClient.on("roleDelete", (discordJsChannel) => handler(discordJsChannel));

exports.addOnMessageReceivedHandler = (handler) => _discordJsBotClient.on("message", (discordJsMessage) => handler(discordJsMessage));
exports.addOnMessageDeletedHandler = (handler) => _discordJsBotClient.on("messageDelete", (discordJsMessage) => handler(discordJsMessage));

exports.addOnBotDisconnectedHandler = (handler) => _discordJsBotClient.on("disconnect", () => handler());
exports.addOnBotReconnectingHandler = (handler) => _discordJsBotClient.on("reconnecting", () => handler());

exports.addOnDebugInfoHandler = (handler) => _discordJsBotClient.on("debug", (info) => handler(info));
exports.addOnWarningHandler = (handler) => _discordJsBotClient.on("warn", (warning) => handler(warning));
exports.addOnBotErrorHandler = (handler) => _discordJsBotClient.on("error", (error) => handler(error));

exports.addOnBotJoinedGuildHandler = (handler) =>
{
    _discordJsBotClient.on("guildCreate", function onGuildCreate(discordJsGuild) 
    {
        //if guild is not on the guild wrapper store, this event triggered because the bot joined a guild
        if (guildStore.hasGuildWrapper(discordJsGuild.id) === false)
            handler(discordJsGuild);
    });
};

exports.addGuildBecameAvailableHandler = (handler) =>
{
    _discordJsBotClient.on("guildCreate", function onGuildBecameAvailable(discordJsGuild) 
    {
        //if guild is already on the bot's list, this event triggered because it became available again
        if (_discordJsBotClient.guilds.cache.has(discordJsGuild.id) === true)
            handler(discordJsGuild);
    });
};

exports.fetchUser = (userId) => 
{
    return _discordJsBotClient.users.fetch(userId)
    .then((userObject) => new UserWrapper(userObject))
    .catch((err) => Promise.reject(err));
};

this.isCreatorOfDiscordElement = (discordId) =>
{
    guildStore.forEachGuild((guildWrapper) =>
    {
        if (guildWrapper.wasDiscordElementCreatedByBot(discordId) === true)
            return true;
    });

    return false;
};