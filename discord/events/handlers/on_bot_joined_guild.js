const guildStore = require("../../guild_store.js");
const config = require("../../../config/config.json");
const guildPatcher = require("../../../patcher/guild_patcher.js");
const MessagePayload = require("../../prototypes/message_payload.js");

module.exports =
{
    name: "guildCreate",
    execute: async (guild) =>
    {
        const guildWrapper = guildStore.addGuild(guild);

        // Try to import guild data from the v3 bot
        guildPatcher();

        const owner = await guildWrapper.fetchOwner();
        
        await owner.sendMessage(new MessagePayload(
            `Thank you for using this bot. To get started, you must ensure I have permissions to manage channels and roles, and then use the command \`${config.prefix}deploy\` in any of the guild's channels which the bot can see. It will create a few necessary roles and categories.`
        ));
    }
};