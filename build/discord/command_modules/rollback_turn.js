"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("ROLLBACK_TURN");
module.exports = RollbackTurnCommand;
function RollbackTurnCommand() {
    var rollbackTurnCommand = new Command(commandData);
    rollbackTurnCommand.addBehaviour(_behaviour);
    rollbackTurnCommand.addRequirements(commandPermissions.assertCommandIsUsedInGameChannel, commandPermissions.assertServerIsOnline, commandPermissions.assertMemberIsTrusted, commandPermissions.assertMemberIsOrganizer);
    return rollbackTurnCommand;
}
function _behaviour(commandContext) {
    var targetedGame = commandContext.getGameTargetedByCommand();
    return targetedGame.rollbackTurn()
        .then(function () { return commandContext.respondToCommand("The turn has been rolled back. It may take a minute or two to update properly."); })
        .catch(function (err) { return commandContext.respondToCommand("An error occurred:\n\n" + err.message); });
}
//# sourceMappingURL=rollback_turn.js.map