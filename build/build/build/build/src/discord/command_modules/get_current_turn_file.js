"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("GET_CURRENT_TURN_FILE");
module.exports = GetCurrentTurnFileCommand;
function GetCurrentTurnFileCommand() {
    var getCurrentTurnFileCommand = new Command(commandData);
    getCurrentTurnFileCommand.addBehaviour(_behaviour);
    getCurrentTurnFileCommand.addRequirements(commandPermissions.assertMemberIsTrusted, commandPermissions.assertCommandIsUsedInGameChannel, commandPermissions.assertMemberIsPlayer, commandPermissions.assertServerIsOnline, commandPermissions.assertGameHasStarted);
    return getCurrentTurnFileCommand;
}
function _behaviour(commandContext) {
    var gameObject = commandContext.getGameTargetedByCommand();
    var gameName = gameObject.getName();
    var messageString = "Attached is your current turn file for " + gameName + ".";
    var playerId = commandContext.getCommandSenderId();
    var currentTurnNumber = gameObject.getCurrentTurnNumber();
    return gameObject.getCurrentTurnFileOfPlayer(playerId)
        .then(function (turnFile) { return commandContext.respondToCommand(messageString, turnFile, gameName + " Turn " + currentTurnNumber + ".2h"); });
}
//# sourceMappingURL=get_current_turn_file.js.map