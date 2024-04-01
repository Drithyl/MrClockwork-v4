const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const MessagePayload = require("../../prototypes/message_payload.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("deploy")
		.setDescription("[Guild-owner-only] Deploy bot channels and roles. Can be used to restore categories and roles.")
        .setDMPermission(false),

	execute: behaviour
};

async function behaviour(commandContext, client)
{
    await commandPermissions.assertMemberIsGuildOwner(commandContext);
    await commandPermissions.assertBotHasPermissionToManageRoles(commandContext);
    await commandPermissions.assertBotHasPermissionToManageChannels(commandContext);

    const targetedGuild = commandContext.guildWrapper;

    await targetedGuild.deployBot(client);
    return commandContext.respondToCommand(new MessagePayload(
        `The bot has been successfully deployed! You may rename or move around the roles, channels and categories created, but do not delete them! If one does get deleted, you can regenerate them by using this command again.`
    ));
}
