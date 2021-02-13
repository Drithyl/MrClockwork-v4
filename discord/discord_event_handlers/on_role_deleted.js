

const guildStore = require("../guild_store.js");
const botClientWrapper = require("../wrappers/bot_client_wrapper.js");


exports.startListening = () =>
{
    console.log("Listening to onRoleDeleted.");
    botClientWrapper.addOnRoleDeletedHandler((role) =>
    {
        const guildWrapper = guildStore.getGuildWrapperById(role.guild.id);

        if (guildWrapper.wasDiscordElementCreatedByBot(role.id) === true)
        {
           guildWrapper.clearData(role.id)
           .then(() => console.log(`Bot Role ${role.name} was deleted; cleared its data as well.`))
           .catch((err) => console.log(`Error when clearing data of role ${role.name} in guild ${role.guild.id}: ${err.message}\n\n${err.stack}`));
        }
    });
};