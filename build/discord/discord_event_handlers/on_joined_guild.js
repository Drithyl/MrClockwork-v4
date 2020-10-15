"use strict";
var guildStore = require("../guild_store.js");
var botClientWrapper = require("../wrappers/bot_client_wrapper.js");
exports.startListening = function () {
    console.log("Listening to onJoinedGuild.");
    botClientWrapper.addOnBotJoinedGuildHandler(_onJoinedGuild);
};
function _onJoinedGuild(discordJsGuild) {
    guildStore.addGuild(discordJsGuild);
    //TODO: message guild owner about the deploy command
}
//# sourceMappingURL=on_joined_guild.js.map