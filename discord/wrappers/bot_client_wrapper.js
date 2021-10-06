
const { Client, Intents } = require("discord.js");
const log = require("../../logger.js");
const guildStore = require("../guild_store.js");
const UserWrapper = require("./user_wrapper.js");
const config = require("../../config/config.json");

// As of DiscordJS v13, these intents are **required**; read more here:
// https://discordjs.guide/popular-topics/intents.html#enabling-intents
const myIntents = new Intents().add(
    "GUILDS",
    "GUILD_MEMBERS",
    "GUILD_MESSAGES",
    "DIRECT_MESSAGES"
);

const _discordJsBotClient = new Client({
    intents: myIntents
});


exports.getId = () => _discordJsBotClient.user.id;

exports.loginToDiscord = () => 
{
    log.general(log.getNormalLevel(), "Logging into Discord...");
    return _discordJsBotClient.login(config.loginToken)
    .then(() => 
    {
        log.general(log.getNormalLevel(), "Bot logged in.");
        return Promise.resolve(_discordJsBotClient.guilds.cache);
    });
};

//wrappers for discord events caught by the bot client in the DiscordJs library
exports.addOnLoggedInHandler = (handler) => _discordJsBotClient.on("ready", () => handler());

exports.addOnBotLeftGuildHandler = (handler) => _discordJsBotClient.on("guildDelete", (discordJsGuild) => handler(discordJsGuild));

exports.addOnGuildUnavailableHandler = (handler) => _discordJsBotClient.on("guildUnavailable", (discordJsGuild) => handler(discordJsGuild));
exports.addOnGuildDeletedHandler = (handler) => _discordJsBotClient.on("guildBecameUnavailable", (discordJsGuild) => handler(discordJsGuild));

exports.addOnChannelDeletedHandler = (handler) => _discordJsBotClient.on("channelDelete", (discordJsChannel) => handler(discordJsChannel));
exports.addOnRoleDeletedHandler = (handler) => _discordJsBotClient.on("roleDelete", (discordJsChannel) => handler(discordJsChannel));

exports.addOnMessageReceivedHandler = (handler) => _discordJsBotClient.on("messageCreate", (discordJsMessage) => handler(discordJsMessage));
exports.addOnMessageDeletedHandler = (handler) => _discordJsBotClient.on("messageDelete", (discordJsMessage) => handler(discordJsMessage));
exports.addOnReactionAddedHandler = (handler) => _discordJsBotClient.on("messageReactionAdd", (discordJsMessageReaction, discordJsUser) => handler(discordJsMessageReaction, discordJsUser));

exports.addOnBotDisconnectedHandler = (handler) => _discordJsBotClient.on("disconnect", () => handler());
exports.addOnBotReconnectingHandler = (handler) => _discordJsBotClient.on("reconnecting", () => handler());

exports.addOnDebugInfoHandler = (handler) => _discordJsBotClient.on("debug", (info) => handler(info));
exports.addOnWarningHandler = (handler) => _discordJsBotClient.on("warn", (warning) => handler(warning));
exports.addOnBotErrorHandler = (handler) => _discordJsBotClient.on("error", (error) => handler(error));

exports.addOnCommandInteractionReceivedHandler = (handler) => 
{
    _discordJsBotClient.on("interaction", (discordJsInteraction) => 
    {
        if (discordJsInteraction.isCommand() === true)
            handler(discordJsInteraction);
    });
};

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