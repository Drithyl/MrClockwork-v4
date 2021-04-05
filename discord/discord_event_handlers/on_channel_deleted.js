
const log = require("../../logger.js");
const guildStore = require("../guild_store.js");
const botClientWrapper = require("../wrappers/bot_client_wrapper.js");
const pendingChannelsStore = require("../pending_game_channel_store.js");


exports.startListening = () =>
{
    log.general(log.getNormalLevel(), "Listening to onChannelDeleted.");
    botClientWrapper.addOnChannelDeletedHandler((channel) =>
    {
        const guildWrapper = guildStore.getGuildWrapperById(channel.guild.id);

        if (guildWrapper.wasDiscordElementCreatedByBot(channel.id) === true)
        {
           guildWrapper.clearData(channel.id)
           .then(() => log.general(log.getNormalLevel(), `Bot Channel ${channel.name} was deleted; cleared its data as well.`))
           .catch((err) => log.error(log.getLeanLevel(), `ERROR CLEARING DATA IN CHANNEL ${channel.name} IN GUILD ${channel.guild.id}`, err));
        }

        else
        {
            pendingChannelsStore.removeGameChannelPendingHosting(channel.id);
            log.general(log.getNormalLevel(), `Channel ${channel.name} was deleted; removed from pending list.`);
        }
    });
};