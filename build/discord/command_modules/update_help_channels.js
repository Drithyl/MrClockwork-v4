"use strict";
var guildStore = require("../guild_store.js");
var commandStore = require("../command_store.js");
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("UPDATE_HELP_CHANNELS");
module.exports = UpdateHelpChannelsCommand;
function UpdateHelpChannelsCommand() {
    var updateHelpChannelsCommand = new Command(commandData);
    updateHelpChannelsCommand.addBehaviour(_behaviour);
    updateHelpChannelsCommand.addSilentRequirements(commandPermissions.assertMemberIsDev);
    return updateHelpChannelsCommand;
}
function _behaviour(commandContext) {
    var commandArgumentsArray = commandContext.getCommandArgumentsArray();
    var idOfGuildToUpdate = commandArgumentsArray[0];
    var updatedHelpString = _createHelpString();
    return guildStore.updateHelpChannels(updatedHelpString, idOfGuildToUpdate)
        .then(function () { return commandContext.respondToCommand("Help channels have been updated."); });
}
function _createHelpString() {
    var string = "Below are the commands available. Each one contains information about what it does and the arguments (sometimes optional, sometimes required) that make them work:\n\n";
    var commands = [];
    commandStore.forEachCommand(function (command) { return commands.push(command); });
    commands.sort(function (a, b) {
        if (a.getName() < b.getName())
            return -1;
        if (a.getName() > b.getName())
            return 1;
        return 0;
    });
    commands.forEach(function (command) { return string += command.getFormattedHelp(); });
    return string;
}
//# sourceMappingURL=update_help_channels.js.map