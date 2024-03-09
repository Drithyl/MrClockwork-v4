
const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const MessagePayload = require("../../prototypes/message_payload.js");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("pin_settings")
		.setDescription("Send and pin the game's settings to the game's channel."),

	execute: behaviour
};

async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsOrganizer(commandContext);

    const gameObject = commandContext.targetedGame;
    await commandContext.respondToCommand(new MessagePayload(`Below are the game's settings:`));
    await gameObject.pinSettingsToChannel();
}
