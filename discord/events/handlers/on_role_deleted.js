const log = require("../../../logger.js");
const guildStore = require("../../guild_store.js");


module.exports =
{
    name: "rateLimit",
    execute: (role) =>
    {
        log.general(log.getNormalLevel(), "Listening to onRoleDeleted.");
        const guildWrapper = guildStore.getGuildWrapperById(role.guild.id);

        if (guildWrapper.wasDiscordElementCreatedByBot(role.id) === true)
        {
            guildWrapper.clearData(role.id)
            .then(() => log.general(log.getNormalLevel(), `Bot Role ${role.name} was deleted; cleared its data as well.`))
            .catch((err) => log.error(log.getLeanLevel(), `ERROR CLEARING DATA OF ROLE ${role.name} IN GUILD ${role.guild.id}`, err));
        }
    }
};