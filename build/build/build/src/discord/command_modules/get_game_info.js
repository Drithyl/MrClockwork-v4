"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("GET_GAME_INFO");
module.exports = GetGameInfoCommand;
function GetGameInfoCommand() {
    var getGameInfoCommand = new Command(commandData);
    getGameInfoCommand.addBehaviour(_behaviour);
    getGameInfoCommand.addRequirements(commandPermissions.assertCommandIsUsedInGameChannel, commandPermissions.assertMemberIsTrusted);
    return getGameInfoCommand;
}
function _behaviour(commandContext) {
    var targetedGame = commandContext.getGameTargetedByCommand();
    return targetedGame.killProcess()
        .then(function () { return commandContext.respondToCommand("The process has been killed."); })
        .catch(function (err) { return commandContext.respondToCommand("An error occurred; process could not be killed:\n\n" + err.message); });
}
//# sourceMappingURL=get_game_info.js.map