"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("LAUNCH_GAME_PROCESS");
module.exports = LaunchGameProcessCommand;
function LaunchGameProcessCommand() {
    var launchGameProcessCommand = new Command(commandData);
    launchGameProcessCommand.addBehaviour(_behaviour);
    launchGameProcessCommand.addRequirements(commandPermissions.assertCommandIsUsedInGameChannel, commandPermissions.assertServerIsOnline, commandPermissions.assertMemberIsTrusted, commandPermissions.assertMemberIsOrganizer);
    return launchGameProcessCommand;
}
function _behaviour(commandContext) {
    var targetedGame = commandContext.getGameTargetedByCommand();
    return commandContext.respondToCommand("Launching process...")
        .then(function () { return targetedGame.launchProcess(); })
        .then(function () { return commandContext.respondToCommand("The process has been launched."); })
        .catch(function (err) { return commandContext.respondToCommand("An error occurred:\n\n" + err.message); });
}
//# sourceMappingURL=launch_game_process.js.map