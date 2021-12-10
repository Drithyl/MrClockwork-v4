
const log = require("../logger.js");
const onRateLimit = require("./discord_event_handlers/on_rate_limit.js");
const onJoinedGuild = require("./discord_event_handlers/on_joined_guild.js");
const onLeftGuild = require("./discord_event_handlers/on_left_guild.js");
const onGuildMemberJoined = require("./discord_event_handlers/on_guild_member_joined.js");
const onGuildMemberRemoved = require("./discord_event_handlers/on_guild_member_removed.js");
const onGuildMemberUpdated = require("./discord_event_handlers/on_guild_member_updated.js");
const onMessageReceived = require("./discord_event_handlers/on_message_received.js");
const onCommandInteractionReceived = require("./discord_event_handlers/on_command_interaction_received.js");
const onReactionAdded = require("./discord_event_handlers/on_reaction_added.js");
const onChannelDeleted = require("./discord_event_handlers/on_channel_deleted.js");
const onRoleDeleted = require("./discord_event_handlers/on_role_deleted.js");

exports.startListening = () =>
{
    log.general(log.getNormalLevel(), "Adding discord event handlers...");
    onRateLimit.startListening();
    onJoinedGuild.startListening();
    onLeftGuild.startListening();
    onGuildMemberJoined.startListening();
    onGuildMemberRemoved.startListening();
    onGuildMemberUpdated.startListening();
    onMessageReceived.startListening();
    onCommandInteractionReceived.startListening();
    onReactionAdded.startListening();
    onChannelDeleted.startListening();
    onRoleDeleted.startListening();
    log.general(log.getNormalLevel(), "Discord event handlers added.");
};