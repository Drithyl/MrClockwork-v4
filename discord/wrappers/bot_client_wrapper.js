
const Discord = require("discord.js");
const config = require("../../config/config.json");
const discordJsBotClient = new Discord.Client();

exports.getId = () => discordJsBotClient.user.id;

exports.loginToDiscord = () => 
{
  console.log("Logging into Discord...");
  return discordJsBotClient.login(config.loginToken)
  .then(() => 
  {
    console.log("Bot logged in.");
    return Promise.resolve(discordJsBotClient.guilds.cache);
  });
};

//wrappers for discord events caught by the bot client in the DiscordJs library
exports.addOnLoggedInHandler = (handler) => discordJsBotClient.on("ready", () => handler());

exports.addOnGuildUnavailableHandler = (handler) => discordJsBotClient.on("guildUnavailable", (discordJsGuild) => handler(discordJsGuild));
exports.addOnGuildDeletedHandler = (handler) => discordJsBotClient.on("guildBecameUnavailable", (discordJsGuild) => handler(discordJsGuild));

exports.addOnChannelDeletedHandler = (handler) => discordJsBotClient.on("channelDelete", (discordJsChannel) => handler(discordJsChannel));

exports.addOnMessageReceivedHandler = (handler) => discordJsBotClient.on("message", (discordJsMessage) => handler(discordJsMessage));
exports.addOnMessageDeletedHandler = (handler) => discordJsBotClient.on("messageDelete", (discordJsMessage) => handler(discordJsMessage));

exports.addOnBotDisconnectedHandler = (handler) => discordJsBotClient.on("disconnect", () => handler());
exports.addOnBotReconnectingHandler = (handler) => discordJsBotClient.on("reconnecting", () => handler());

exports.addOnDebugInfoHandler = (handler) => discordJsBotClient.on("debug", (info) => handler(info));
exports.addOnWarningHandler = (handler) => discordJsBotClient.on("warn", (warning) => handler(warning));
exports.addOnBotErrorHandler = (handler) => discordJsBotClient.on("error", (error) => handler(error));

exports.addOnBotJoinedGuildHandler = (handler) =>
{
  discordJsBotClient.on("guildCreate", function onGuildCreate(discordJsGuild) 
  {
    //if guild is not on the bot's list, this event triggered because the bot joined a guild
    if (discordJsBotClient.hasGuild(discordJsGuild.id) === false)
      handler(discordJsGuild);
  });
};

exports.addGuildBecameAvailableHandler = (handler) =>
{
  discordJsBotClient.on("guildCreate", function onGuildBecameAvailable(discordJsGuild) 
  {
    //if guild is already on the bot's list, this event triggered because it became available again
    if (discordJsBotClient.hasGuild(discordJsGuild.id) === true)
      handler(discordJsGuild);
  });
};

