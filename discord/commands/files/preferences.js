const { SlashCommandBuilder } = require("discord.js");
const config = require("../../../config/config.json");
const commandPermissions = require("../../command_permissions.js");
const MessagePayload = require("../../prototypes/message_payload.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("preferences")
		.setDescription("Displays the player game preferences menu (global preferences if used by DM)."),

	execute: behaviour
};

async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsTrusted(commandContext);

    return commandContext.respondToCommand(
        new MessagePayload(
            `You can change your preferences by accessing the bot's website at ${config.fullSecureUrl}`
        )
    );
}
