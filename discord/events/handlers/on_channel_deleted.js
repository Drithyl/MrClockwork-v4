const log = require("../../../logger.js");
const guildStore = require("../../guild_store.js");

module.exports =
{
    name: "channelDelete",
    execute: async (channel) =>
    {
        const guildWrapper = guildStore.getGuildWrapperById(channel.guild.id);

        if (guildWrapper.wasDiscordElementCreatedByBot(channel.id) === false)
            return;

        try
        {
            await guildWrapper.clearData(channel.id);
            log.general(log.getNormalLevel(), `Bot Channel ${channel.name} was deleted; cleared its data as well.`);
        }

        catch(err) 
        {
            log.error(log.getLeanLevel(), `ERROR CLEARING DATA IN CHANNEL ${channel.name} IN GUILD ${channel.guild.id}`, err);
        }
    }
};