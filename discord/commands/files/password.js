const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("password")
		.setDescription("[Organizer-only] Sends the game's master password by DM.")
        .setDMPermission(false),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);
    await commandPermissions.assertMemberIsTrusted(commandContext);
    await commandPermissions.assertMemberIsOrganizer(commandContext);

    const targetedGame = commandContext.targetedGame;
    const ip = targetedGame.getIp();
    const port = targetedGame.getPort();
    const settingsObject = targetedGame.getSettingsObject();
    const masterPasswordSetting = settingsObject.getMasterPasswordSetting();
    const masterPassword = masterPasswordSetting.getValue();

    return commandContext.respondToSender(new MessagePayload(
        `**${targetedGame.getName()}**'s (${ip}:${port}) master password is \`${masterPassword}\`.`
    ));
}
