
const onJoinedGuild = require("./discord_event_handlers/on_joined_guild.js");
const onMessageReceived = require("./discord_event_handlers/on_message_received.js");
const onChannelDeleted = require("./discord_event_handlers/on_channel_deleted.js");

exports.startListening = () =>
{
    console.log("Adding discord event handlers...");
    onJoinedGuild.startListening();
    onMessageReceived.startListening();
    onChannelDeleted.startListening();
    console.log("Discord event handlers added.");
};