"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("CHECK_CURRENT_TIMER");
module.exports = CheckCurrentTimerCommand;
function CheckCurrentTimerCommand() {
    var checkCurrentTimerCommand = new Command(commandData);
    checkCurrentTimerCommand.addBehaviour(_behaviour);
    checkCurrentTimerCommand.addRequirements(commandPermissions.assertMemberIsTrusted, commandPermissions.assertCommandIsUsedInGameChannel);
    return checkCurrentTimerCommand;
}
function _behaviour(commandContext) {
    var gameObject = commandContext.getGameTargetedByCommand();
    var currentTimerObject = gameObject.getCurrentTimerObject();
    var timeLeftAsString = currentTimerObject.printTimeLeft();
    return commandContext.respondToCommand(timeLeftAsString);
}
//# sourceMappingURL=check_current_timer.js.map