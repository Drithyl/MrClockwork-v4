const { SlashCommandBuilder } = require("discord.js");
const activeMenuStore = require("../../../menus/active_menu_store.js");
const MessagePayload = require("../../prototypes/message_payload.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Print a list of the available commands."),

	execute: behaviour
};


function behaviour(commandContext)
{
	if (commandContext.isDm === false) {
		commandContext.respondToCommand(new MessagePayload(`Check your DMs for the help menu.`));
	}

    return activeMenuStore.startHelpMenu(commandContext);
}
