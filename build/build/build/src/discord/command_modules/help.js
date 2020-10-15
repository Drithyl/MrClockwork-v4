"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var activeMenuStore = require("../../menus/active_menu_store.js");
var commandData = new CommandData("HELP");
module.exports = HelpCommand;
function HelpCommand() {
    var helpCommand = new Command(commandData);
    helpCommand.addBehaviour(_behaviour);
    return helpCommand;
}
function _behaviour(commandContext) {
    return activeMenuStore.startHelpMenu(commandContext);
}
//# sourceMappingURL=help.js.map