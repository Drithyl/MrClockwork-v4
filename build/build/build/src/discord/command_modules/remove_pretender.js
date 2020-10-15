"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var dominions5NationStore = require("../../games/dominions5_nation_store.js");
var SemanticError = require("../../errors/custom_errors.js").SemanticError;
var commandData = new CommandData("REMOVE_PRETENDER");
module.exports = RemovePretenderCommand;
function RemovePretenderCommand() {
    var removePretenderCommand = new Command(commandData);
    removePretenderCommand.addBehaviour(_behaviour);
    removePretenderCommand.addRequirements(commandPermissions.assertMemberIsTrusted, commandPermissions.assertCommandIsUsedInGameChannel, commandPermissions.assertGameIsOnline, commandPermissions.assertGameHasNotStarted, commandPermissions.assertMemberIsPlayer, assertNationNameExists, assertMemberIsOwnerOfPretender);
    return removePretenderCommand;
}
/*TODO: I'm getting rid of the pretender display requirement. Instead,
the command to display pretenders can be used to check the names of nations
that have a pretender file submitted, to easily copy and paste it for this command,
but it does not necessarily need to be used if one already knows the nation name
of the pretender submitted, which will be checked within the game.removePretender() function*/
function _behaviour(commandContext) {
    var gameObject = commandContext.getGameTargetedByCommand();
    var nameOfNationToBeRemoved = extractNationNameArgument(commandContext);
    return gameObject.removePretender(nameOfNationToBeRemoved)
        .then(function () { return commandContext.respondToCommand("Pretender was removed."); })
        .catch(function (err) { return commandContext.respondToCommand("Error occurred when removing pretender:\n\n" + err.message); });
}
function assertNationNameExists(commandContext) {
    var nationName = extractNationNameArgument(commandContext);
    var gameObject = commandContext.getGameTargetedByCommand();
    var gameSettings = gameObject.getSettingsObject();
    var eraSetting = gameSettings.getEraSetting();
    var eraValue = eraSetting.getValue();
    if (dominions5NationStore.isValidNationIdentifierInEra(nationName, eraValue) === false)
        throw new SemanticError("Invalid nation selected. Name does not match any nation in this era.");
}
function assertMemberIsOwnerOfPretender(commandContext) {
    var gameObject = commandContext.getGameTargetedByCommand();
    var commandArguments = commandContext.getCommandArgumentsArray();
    var nameOfNationToBeRemoved = commandArguments[0];
    var playerGuildMemberWrapper = commandContext.getSenderGuildMemberWrapper();
    if (gameObject.isPlayerOwnerOfPretender(playerGuildMemberWrapper, nameOfNationToBeRemoved) === false)
        throw new Error("You are not the owner of this nation.");
}
function extractNationNameArgument(commandContext) {
    var commandArguments = commandContext.getCommandArgumentsArray();
    var nameOfNationToBeRemoved = commandArguments[0];
    return nameOfNationToBeRemoved;
}
//# sourceMappingURL=remove_pretender.js.map