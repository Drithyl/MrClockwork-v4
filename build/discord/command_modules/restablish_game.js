"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var ongoingGamesStore = require("../../games/ongoing_games_store.js");
var commandData = new CommandData("RESTABLISH_GAME");
module.exports = RestablishGameCommand;
function RestablishGameCommand() {
    var restablishGameCommand = new Command(commandData);
    restablishGameCommand.addBehaviour(_behaviour);
    restablishGameCommand.addRequirements(commandPermissions.assertMemberIsTrusted, commandPermissions.assertMemberIsOrganizer);
    return restablishGameCommand;
}
function _behaviour(commandContext) {
    var commandArgumentsArray = commandContext.getCommandArgumentsArray();
    var nameOfGameToRepair = commandArgumentsArray[0];
    var gameObject;
    var discordEnvironmentObject;
    if (ongoingGamesStore.hasGameByName(nameOfGameToRepair) === false)
        return commandContext.respondToCommand("No game found with this name.");
    gameObject = ongoingGamesStore.getGameByName(nameOfGameToRepair);
    discordEnvironmentObject = gameObject.getDiscordEnvironment();
    return discordEnvironmentObject.restablishChannelAndRole()
        .then(function () { return commandContext.respondToCommand("The game's channel and role have been restablished."); })
        .catch(function (err) { return commandContext.respondToCommand("Error occurred when restablishing the game's Discord environment:\n\n" + err.message); });
}
//# sourceMappingURL=restablish_game.js.map