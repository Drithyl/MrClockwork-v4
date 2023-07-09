const { SlashCommandBuilder } = require("discord.js");
const activeMenuStore = require("../../../menus/active_menu_store.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Print a list of the available commands."),

	execute: behaviour
};


function behaviour(commandContext)
{
    return activeMenuStore.startHelpMenu(commandContext);
}