const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("kill")
		.setDescription("Shuts down the game's process. Useful to relaunch it to fix common errors. Doesn't delete anything."),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);
    await commandPermissions.assertServerIsOnline(commandContext);
    await commandPermissions.assertMemberIsTrusted(commandContext);
    await commandPermissions.assertMemberIsOrganizer(commandContext);

    const targetedGame = commandContext.targetedGame;

    await commandContext.respondToCommand(new MessagePayload(`Killing process...`));
    await targetedGame.kill();
    return commandContext.respondToCommand(new MessagePayload(`The process has been killed.`));
}