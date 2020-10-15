"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("GET_LIST_OF_UNDONE_TURNS");
module.exports = GetListOfUndoneTurnsCommand;
function GetListOfUndoneTurnsCommand() {
    var getListOfUndoneTurnsCommand = new Command(commandData);
    getListOfUndoneTurnsCommand.addBehaviour(_behaviour);
    getListOfUndoneTurnsCommand.addRequirements(commandPermissions.assertMemberIsTrusted, commandPermissions.assertCommandIsUsedInGameChannel, commandPermissions.assertMemberIsPlayer, commandPermissions.assertServerIsOnline, commandPermissions.assertGameHasStarted);
    return getListOfUndoneTurnsCommand;
}
function _behaviour(commandContext) {
    var gameObject = commandContext.getGameTargetedByCommand();
    var messageString = "Below is the list of undone turns:\n\n";
    var listString = "";
    return gameObject.getListOfUndoneTurns()
        .then(function (listAsArray) {
        listAsArray.forEach(function (nationFullName) {
            listString += nationFullName + "\n";
        });
        return commandContext.respondToCommand(messageString + listString.toBox());
    });
}
//# sourceMappingURL=get_list_of_undone_turns.js.map