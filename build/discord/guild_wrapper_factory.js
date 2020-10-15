"use strict";
var guildDataStore = require("./guild_data_store.js");
var GuildWrapper = require("./wrappers/guild_wrapper.js");
module.exports.wrapDiscordJsGuild = function (discordJsGuildObject) {
    var id = discordJsGuildObject.id;
    console.log("Wrapping " + discordJsGuildObject.name + "...");
    if (guildDataStore.hasGuildData(id) === false) {
        console.log("No bot data found for guild.");
        guildDataStore.createGuildData(id);
    }
    return new GuildWrapper(discordJsGuildObject);
};
//# sourceMappingURL=guild_wrapper_factory.js.map