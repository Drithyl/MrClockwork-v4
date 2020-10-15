"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("GET_DOM5_SCORES");
module.exports = GetDom5ScoresCommand;
function GetDom5ScoresCommand() {
    var getDom5ScoresCommand = new Command(commandData);
    getDom5ScoresCommand.addBehaviour(_behaviour);
    getDom5ScoresCommand.addRequirements(commandPermissions.assertMemberIsTrusted, commandPermissions.assertCommandIsUsedInGameChannel, commandPermissions.assertServerIsOnline, commandPermissions.assertGameHasStarted);
    return getDom5ScoresCommand;
}
function _behaviour(commandContext) {
    var gameObject = commandContext.getGameTargetedByCommand();
    var gameName = gameObject.getName();
    var messageString = "Attached is the scores file for " + gameName + ".";
    return gameObject.getScoresFile()
        .then(function (scoresFile) { return commandContext.respondToCommand(messageString, scoresFile, gameName + " Scores.txt"); });
}
//# sourceMappingURL=get_dom5_scores.js.map