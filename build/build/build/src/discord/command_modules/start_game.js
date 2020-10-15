"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("START_GAME");
module.exports = StartGameCommand;
function StartGameCommand() {
    var startGameCommand = new Command(commandData);
    startGameCommand.addBehaviour(_behaviour);
    startGameCommand.addRequirements(commandPermissions.assertCommandIsUsedInGameChannel, commandPermissions.assertServerIsOnline, commandPermissions.assertMemberIsTrusted, commandPermissions.assertMemberIsOrganizer);
    return startGameCommand;
}
function _behaviour(commandContext) {
    var targetedGame = commandContext.getGameTargetedByCommand();
    return targetedGame.startGame()
        .then(function () { return commandContext.respondToCommand("The game has started setup process. Depending on the map and players, it may take a significant amount of time."); })
        .catch(function (err) { return commandContext.respondToCommand("An error occurred:\n\n" + err.message); });
}
//# sourceMappingURL=start_game.js.map