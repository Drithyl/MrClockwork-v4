
const { Client, Intents } = require("discord.js");
const log = require("../../logger.js");
const guildStore = require("../guild_store.js");
const UserWrapper = require("./user_wrapper.js");
const config = require("../../config/config.json");
const GuildMemberWrapper = require("./guild_member_wrapper.js");

// As of DiscordJS v13, these intents are **required**; read more here:
// https://discordjs.guide/popular-topics/intents.html#enabling-intents
const myIntents = new Intents().add(
    "GUILDS",
    "GUILD_MEMBERS",
    "GUILD_MESSAGES",
    "DIRECT_MESSAGES",
    "GUILD_MESSAGE_REACTIONS",
    "DIRECT_MESSAGE_REACTIONS"
);

const _discordJsBotClient = new Client({
    intents: myIntents,
    // Needs to be enabled for the bot to receive DMs, or reactions by DMs;
    // https://discordjs.guide/additional-info/changes-in-v13.html#dm-channels
    partials: [ "MESSAGE", "CHANNEL", "REACTION" ]
});

var _devUserWrapper;


exports.getId = () => _discordJsBotClient.user.id;

exports.loginToDiscord = async () => 
{
    log.general(log.getNormalLevel(), "Logging into Discord...");
    await _discordJsBotClient.login(config.loginToken);
    log.general(log.getNormalLevel(), "Bot logged in.");

    // Fetch dev Discord user for potential messaging
    if (config.devIds != null && config.devIds.length > 0)
    {
        _devUserWrapper = await _discordJsBotClient.users.fetch(config.devIds[0]);
        _devUserWrapper = new UserWrapper(_devUserWrapper)
    }

    return _discordJsBotClient.guilds.cache;
};

exports.messageDev = async (payload) => _devUserWrapper.sendMessage(payload);

//wrappers for discord events caught by the bot client in the DiscordJs library
exports.addOnLoggedInHandler = (handler) => _discordJsBotClient.on("ready", () => handler());

exports.addOnRateLimitHandler = (handler) => _discordJsBotClient.on("rateLimit", (rateLimitData) => handler(rateLimitData));

exports.addOnBotLeftGuildHandler = (handler) => _discordJsBotClient.on("guildDelete", (discordJsGuild) => handler(discordJsGuild));

exports.addOnGuildUnavailableHandler = (handler) => _discordJsBotClient.on("guildUnavailable", (discordJsGuild) => handler(discordJsGuild));
exports.addOnGuildDeletedHandler = (handler) => _discordJsBotClient.on("guildBecameUnavailable", (discordJsGuild) => handler(discordJsGuild));
exports.addOnGuildMemberJoinedHandler = (handler) => _discordJsBotClient.on("guildMemberAdd", (discordJsGuildMember) => handler(new GuildMemberWrapper(discordJsGuildMember, guildStore.getGuildWrapperById(discordJsGuildMember.guild.id))));
exports.addOnGuildMemberRemovedHandler = (handler) => _discordJsBotClient.on("guildMemberRemove", (discordJsGuildMember) => handler(new GuildMemberWrapper(discordJsGuildMember, guildStore.getGuildWrapperById(discordJsGuildMember.guild.id))));
exports.addOnGuildMemberUpdatedHandler = (handler) => _discordJsBotClient.on("guildMemberUpdate", (oldDiscordJsGuildMember, newDiscordJsGuildMember) => 
{
    handler(
        new GuildMemberWrapper(oldDiscordJsGuildMember, guildStore.getGuildWrapperById(oldDiscordJsGuildMember.guild.id)),
        new GuildMemberWrapper(newDiscordJsGuildMember, guildStore.getGuildWrapperById(newDiscordJsGuildMember.guild.id))
    );
});

exports.addOnChannelDeletedHandler = (handler) => _discordJsBotClient.on("channelDelete", (discordJsChannel) => handler(discordJsChannel));
exports.addOnRoleDeletedHandler = (handler) => _discordJsBotClient.on("roleDelete", (discordJsChannel) => handler(discordJsChannel));

exports.addOnMessageReceivedHandler = (handler) => _discordJsBotClient.on("messageCreate", (discordJsMessage) => handler(discordJsMessage));
exports.addOnMessageDeletedHandler = (handler) => _discordJsBotClient.on("messageDelete", (discordJsMessage) => handler(discordJsMessage));
exports.addOnReactionAddedHandler = (handler) => _discordJsBotClient.on("messageReactionAdd", (discordJsMessageReaction, discordJsUser) => handler(discordJsMessageReaction, discordJsUser));
exports.addOnReactionRemovedHandler = (handler) => _discordJsBotClient.on("messageReactionRemove", (discordJsMessageReaction, discordJsUser) => handler(discordJsMessageReaction, discordJsUser));

exports.addOnBotDisconnectedHandler = (handler) => _discordJsBotClient.on("disconnect", () => handler());
exports.addOnBotReconnectingHandler = (handler) => _discordJsBotClient.on("reconnecting", () => handler());

exports.addOnDebugInfoHandler = (handler) => _discordJsBotClient.on("debug", (info) => handler(info));
exports.addOnWarningHandler = (handler) => _discordJsBotClient.on("warn", (warning) => handler(warning));
exports.addOnBotErrorHandler = (handler) => _discordJsBotClient.on("error", (error) => handler(error));

exports.addOnCommandInteractionReceivedHandler = (handler) => 
{
    _discordJsBotClient.on("interactionCreate", (discordJsInteraction) => 
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
    return _discordJsBotClient.users.fetch(userId, { cache: true })
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