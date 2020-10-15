
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");

const activeMenuStore = require("../../menus/active_menu_store.js");

const commandData = new CommandData("HELP");

module.exports = HelpCommand;

function HelpCommand()
{
    const helpCommand = new Command(commandData);

    helpCommand.addBehaviour(_behaviour);

    return helpCommand;
}

function _behaviour(commandContext)
{
    return activeMenuStore.startHelpMenu(commandContext);
}