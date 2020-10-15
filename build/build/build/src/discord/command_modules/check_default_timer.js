"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("CHECK_CURRENT_TIMER");
module.exports = CheckDefaultTimerCommand;
function CheckDefaultTimerCommand() {
    var checkDefaultTimerCommand = new Command(commandData);
    checkDefaultTimerCommand.addBehaviour(_behaviour);
    checkDefaultTimerCommand.addRequirements(commandPermissions.assertMemberIsTrusted, commandPermissions.assertCommandIsUsedInGameChannel);
    return checkDefaultTimerCommand;
}
function _behaviour(commandContext) {
    var gameObject = commandContext.getGameTargetedByCommand();
    var currentTimerObject = gameObject.getCurrentTimerObject();
    return commandContext.respondToCommand(currentTimerObject.printDefaultTimer());
}
//# sourceMappingURL=check_default_timer.js.map