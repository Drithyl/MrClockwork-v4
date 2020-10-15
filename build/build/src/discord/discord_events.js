"use strict";
var onJoinedGuild = require("./discord_event_handlers/on_joined_guild.js");
var onMessageReceived = require("./discord_event_handlers/on_message_received.js");
exports.startListening = function () {
    console.log("Adding discord event handlers...");
    onJoinedGuild.startListening();
    onMessageReceived.startListening();
    console.log("Discord event handlers added.");
};
//# sourceMappingURL=discord_events.js.map