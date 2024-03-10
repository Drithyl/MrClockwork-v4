const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");
const log = require("../../../logger.js");


const LEVEL_OPTION_NAME = "verbosity_level";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("set_log_level")
		.setDescription("[Dev-only] Sets the verbosity level of the logging functions to the console and files.")
        .addIntegerOption(option =>
            option.setName(LEVEL_OPTION_NAME)
            .setDescription("The numerical level of logging verbosity, inclusive from 0 (lean) to 2 (verbose).")
            .setMinValue(0)
            .setMaxValue(2)
            .setRequired(true)
        ),

	execute: behaviour,

    // This command will never be deployed globally; only to a private dev guild
    isDev: true
};


async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsDev(commandContext);

    const logLevel = commandContext.options.getInteger(LEVEL_OPTION_NAME);

    log.setLogLevel(logLevel);
    return commandContext.respondToCommand(new MessagePayload(
        `Log level set to ${log.getLogLevel()}.`
    ));
}
