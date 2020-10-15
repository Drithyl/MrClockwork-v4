"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var SemanticError = require("../../errors/custom_errors.js").SemanticError;
var commandData = new CommandData("CREATE_GAME_CHANNEL");
module.exports = CreateGameChannelCommand;
function CreateGameChannelCommand() {
    var createGameChannelCommand = new Command(commandData);
    createGameChannelCommand.addBehaviour(_behaviour);
    createGameChannelCommand.addRequirements(commandPermissions.assertMemberIsTrusted, _doesNameContainInvalidCharacters);
    return createGameChannelCommand;
}
function _behaviour(commandContext) {
    var gameObject = commandContext.getGameTargetedByCommand();
    var commandArguments = commandContext.getCommandArgumentsArray();
    var nameOfNationToBeClaimed = commandArguments[0];
    //TODO: check nation name/filename here, with the dom5 nation JSON data?
    return gameObject.claimPretender(nameOfNationToBeClaimed);
}
function _doesNameContainInvalidCharacters(commandContext) {
    var commandArguments = commandContext.getCommandArgumentsArray();
    var nameOfChannel = commandArguments[0];
    if (/[^0-9A-Z\-_]/i.test(nameOfChannel) === true)
        throw new SemanticError("Name contains invalid cahracters.");
}
//# sourceMappingURL=create_game_channel.js.map