const log = require("../../../logger.js");
const guildStore = require("../../guild_store.js");

module.exports =
{
    name: "guildDelete",
    execute: async (guild) =>
    {
        try
        {
            await guildStore.removeGuild(guild);
        }

        catch(err)
        {
            log.error(log.getLeanLevel(), `ERROR WHEN BOT LEFT GUILD ${guild.name}`, err);
        }
    }
};