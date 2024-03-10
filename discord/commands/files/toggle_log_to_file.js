const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");
const log = require("../../../logger.js");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("toggle_log_to_file")
		.setDescription("[Dev-only] Sets whether the bot will log its prints to files."),

	execute: behaviour,

    // This command will never be deployed globally; only to a private dev guild
    isDev: true
};


async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsDev(commandContext);

    const result = log.toggleLogToFile();
    return commandContext.respondToCommand(new MessagePayload(`\`Log to file\` set to ${result}.`));
}
