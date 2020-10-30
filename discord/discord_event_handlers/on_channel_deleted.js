

const botClientWrapper = require("../wrappers/bot_client_wrapper.js");
const pendingChannelsStore = require("../pending_game_channel_store.js");


exports.startListening = () =>
{
    console.log("Listening to onChannelDeleted.");
    botClientWrapper.addOnChannelDeletedHandler((channel) =>
    {
        pendingChannelsStore.removeGameChannelPendingHosting(channel.id);
        console.log(`Channel ${channel.name} was deleted; removed from pending list.`);
    });
};