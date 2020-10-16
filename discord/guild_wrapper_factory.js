
const guildDataStore = require("./guild_data_store.js");
const GuildWrapper = require("./wrappers/guild_wrapper.js");


module.exports.wrapDiscordJsGuild = function(discordJsGuildObject)
{
  var id = discordJsGuildObject.id;

  console.log(`Wrapping ${discordJsGuildObject.name}...`);

  if (guildDataStore.hasGuildData(id) === false)
  {
    console.log("No bot data found for guild.");
    guildDataStore.createGuildData(id);
  }
  
  return new GuildWrapper(discordJsGuildObject);
};
