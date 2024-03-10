const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("patreon")
		.setDescription("Prints a link to the Patreon for those who wish to support the project. Thank you!"),

	execute: behaviour
};

function behaviour(commandContext)
{
    return commandContext.respondToCommand(new MessagePayload(`If you are considering contributing to the project, you can read more information and do so here: https://www.patreon.com/MrClockwork. Thank you!`));
}
