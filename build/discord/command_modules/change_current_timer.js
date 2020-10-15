"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var Timer = require("../../time_left_prototype");
var commandData = new CommandData("CHANGE_CURRENT_TIMER");
module.exports = ChangeCurrentTimerCommand;
function ChangeCurrentTimerCommand() {
    var changeCurrentTimerCommand = new Command(commandData);
    changeCurrentTimerCommand.addBehaviour(_behaviour);
    changeCurrentTimerCommand.addRequirements(commandPermissions.assertMemberIsTrusted, commandPermissions.assertCommandIsUsedInGameChannel);
    return changeCurrentTimerCommand;
}
function _behaviour(commandContext) {
    var gameObject = commandContext.getGameTargetedByCommand();
    var commandArguments = commandContext.getCommandArgumentsArray();
    var newTimerAsString = commandArguments[0];
    return Promise.resolve()
        .then(function () {
        if (isTimerAddedToCurrentTimer(newTimerAsString))
            addTimeToGame(newTimerAsString, gameObject);
        else
            changeTimerForGame(newTimerAsString, gameObject);
    })
        .then(function () { return commandContext.respondToCommand("The timer was changed. It may take a minute to update."); });
}
function isTimerAddedToCurrentTimer(newTimerAsString) {
    return newTimerAsString.indexOf("+") === 0;
}
function addTimeToGame(newTimerAsString, gameObject) {
    var newTimerStripped = newTimerAsString.replace(/\+/, "");
    var newTimerInMs = Timer.parseTimeLeftToMs(newTimerStripped);
    return gameObject.addTimeToCurrentTimer(newTimerInMs);
}
function changeTimerForGame(newTimerAsString, gameObject) {
    var newTimerInMs = Timer.parseTimeLeftToMs(newTimerAsString);
    return gameObject.changeCurrentTimer(newTimerInMs);
}
//# sourceMappingURL=change_current_timer.js.map