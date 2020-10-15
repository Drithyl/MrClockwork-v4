"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("KILL_GAME_PROCESS");
module.exports = KillGameProcessCommand;
function KillGameProcessCommand() {
    var killGameProcessCommand = new Command(commandData);
    killGameProcessCommand.addBehaviour(_behaviour);
    killGameProcessCommand.addRequirements(commandPermissions.assertCommandIsUsedInGameChannel, commandPermissions.assertServerIsOnline, commandPermissions.assertMemberIsTrusted, commandPermissions.assertMemberIsOrganizer);
    return killGameProcessCommand;
}
function _behaviour(commandContext) {
    var targetedGame = commandContext.getGameTargetedByCommand();
    return commandContext.respondToCommand("Killing process...")
        .then(function () { return targetedGame.killProcess(); })
        .then(function () { return commandContext.respondToCommand("The process has been killed."); })
        .catch(function (err) { return commandContext.respondToCommand("An error occurred:\n\n" + err.message); });
}
//# sourceMappingURL=kill_game_process.js.map