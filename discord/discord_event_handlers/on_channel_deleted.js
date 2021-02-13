

const guildStore = require("../guild_store.js");
const botClientWrapper = require("../wrappers/bot_client_wrapper.js");
const pendingChannelsStore = require("../pending_game_channel_store.js");


exports.startListening = () =>
{
    console.log("Listening to onChannelDeleted.");
    botClientWrapper.addOnChannelDeletedHandler((channel) =>
    {
        const guildWrapper = guildStore.getGuildWrapperById(channel.guild.id);

        if (guildWrapper.wasDiscordElementCreatedByBot(channel.id) === true)
        {
           guildWrapper.clearData(channel.id)
           .then(() => console.log(`Bot Channel ${channel.name} was deleted; cleared its data as well.`))
           .catch((err) => console.log(`Error when clearing data of channel ${channel.name} in guild ${channel.guild.id}: ${err.message}\n\n${err.stack}`));
        }

        else
        {
            pendingChannelsStore.removeGameChannelPendingHosting(channel.id);
            console.log(`Channel ${channel.name} was deleted; removed from pending list.`);
        }
    });
};