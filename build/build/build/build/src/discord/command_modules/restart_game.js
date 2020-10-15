"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("RESTART_GAME");
module.exports = RestartGameCommand;
function RestartGameCommand() {
    var restartGameCommand = new Command(commandData);
    restartGameCommand.addBehaviour(_behaviour);
    restartGameCommand.addRequirements(commandPermissions.assertCommandIsUsedInGameChannel, commandPermissions.assertServerIsOnline, commandPermissions.assertMemberIsTrusted, commandPermissions.assertMemberIsOrganizer);
    return restartGameCommand;
}
function _behaviour(commandContext) {
    var targetedGame = commandContext.getGameTargetedByCommand();
    return targetedGame.restartGame()
        .then(function () { return commandContext.respondToCommand("The game has been restarted. It may take a minute or two to update properly."); })
        .catch(function (err) { return commandContext.respondToCommand("An error occurred:\n\n" + err.message); });
}
//# sourceMappingURL=restart_game.js.map