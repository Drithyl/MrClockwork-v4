"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("DISPLAY_SUBMITTED_PRETENDERS");
module.exports = DisplaySubmittedPretendersCommand;
function DisplaySubmittedPretendersCommand() {
    var displaySubmittedPretendersCommand = new Command(commandData);
    displaySubmittedPretendersCommand.addBehaviour(_behaviour);
    displaySubmittedPretendersCommand.addRequirements(commandPermissions.assertCommandIsUsedInGameChannel, commandPermissions.assertServerIsOnline, commandPermissions.assertMemberIsTrusted);
    return displaySubmittedPretendersCommand;
}
function _behaviour(commandContext) {
    var formattedListAsString;
    var game = commandContext.getGameTargetedByCommand();
    game.getSubmittedPretenders()
        .then(function (listAsArray) {
        formattedListAsString = _formatSubmittedPretenderList(listAsArray);
        commandContext.respondToCommand(formattedListAsString);
    });
}
function _formatSubmittedPretenderList(listAsArray) {
    var formattedListAsString = "";
    listAsArray.forEach(function (submittedPretender, index) {
        return formattedListAsString += index + ". " + _formatSubmittedPretenderLine(submittedPretender);
    });
    return formattedListAsString;
}
function _formatSubmittedPretenderLine(submittedPretender) {
    var fullNationName = submittedPretender.getFullNationName();
    var pretenderOwner = submittedPretender.getOwnerUsername();
    if (submittedPretender.isClaimed() === true)
        return fullNationName.width(40) + " " + pretenderOwner + "\n";
    else
        return fullNationName + "\n";
}
//# sourceMappingURL=display_submitted_pretenders.js.map