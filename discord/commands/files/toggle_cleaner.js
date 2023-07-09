const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");
const cleaner = require("../../../cleaner.js");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("toggle_cleaner")
		.setDescription("[Dev-only] Sets whether the bot will regularly clean unused map and mod files."),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsDev(commandContext);

    let result = cleaner.toggleIsCleaningEnabled();
    return commandContext.respondToCommand(new MessagePayload(`\`isCleaningEnabled\` set to ${result}.`));
}
