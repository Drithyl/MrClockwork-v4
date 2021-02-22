
const onJoinedGuild = require("./discord_event_handlers/on_joined_guild.js");
const onLeftGuild = require("./discord_event_handlers/on_left_guild.js");
const onMessageReceived = require("./discord_event_handlers/on_message_received.js");
const onChannelDeleted = require("./discord_event_handlers/on_channel_deleted.js");
const onRoleDeleted = require("./discord_event_handlers/on_role_deleted.js");

exports.startListening = () =>
{
    console.log("Adding discord event handlers...");
    onJoinedGuild.startListening();
    onLeftGuild.startListening();
    onMessageReceived.startListening();
    onChannelDeleted.startListening();
    onRoleDeleted.startListening();
    console.log("Discord event handlers added.");
};