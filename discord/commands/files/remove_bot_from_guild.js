const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("remove_bot_from_guild")
		.setDescription("[Guild-owner-only] CAREFUL. Will attempt to delete ALL deployment from bot.")
        .setDMPermission(false),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsGuildOwner(commandContext);
    await commandPermissions.assertBotHasPermissionToManageRoles(commandContext);
    await commandPermissions.assertBotHasPermissionToManageChannels(commandContext);

    const targetedGuild = commandContext.guildWrapper;

    await targetedGuild.undeployBot();
    return commandContext.respondToCommand(new MessagePayload(
        `Cleaning of the bot roles and channels will be performed.`
    ));
}
