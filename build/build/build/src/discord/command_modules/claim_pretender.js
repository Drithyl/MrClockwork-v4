"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("CLAIM_PRETENDER");
module.exports = ClaimPretenderCommand;
function ClaimPretenderCommand() {
    var claimPretenderCommand = new Command(commandData);
    claimPretenderCommand.addBehaviour(_behaviour);
    claimPretenderCommand.addRequirements(commandPermissions.assertMemberIsTrusted, commandPermissions.assertCommandIsUsedInGameChannel, commandPermissions.assertGameIsOnline, commandPermissions.assertGameHasNotStarted);
    return claimPretenderCommand;
}
/*TODO: I'm getting rid of the pretender display requirement. Instead,
the command to display pretenders can be used to check the names of nations
that have a pretender file submitted, to easily copy and paste it for this command,
but it does not necessarily need to be used if one already knows the nation name
of the pretender submitted, which will be checked within the game.claimPretender() function*/
function _behaviour(commandContext) {
    var gameObject = commandContext.getGameTargetedByCommand();
    var commandArguments = commandContext.getCommandArgumentsArray();
    var nameOfNationToBeClaimed = commandArguments[0];
    //TODO: check nation name/filename here, with the dom5 nation JSON data?
    return gameObject.claimPretender(nameOfNationToBeClaimed)
        .then(function () { return commandContext.respondToCommand("Pretender was claimed."); })
        .catch(function (err) { return commandContext.respondToCommand("Error occurred when claiming pretender:\n\n" + err.message); });
}
//# sourceMappingURL=claim_pretender.js.map