"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("SUBSCRIBE_TO_GAME");
module.exports = SubscribeToGameCommand;
function SubscribeToGameCommand() {
    var subscribeToGameCommand = new Command(commandData);
    subscribeToGameCommand.addBehaviour(_behaviour);
    subscribeToGameCommand.addRequirements(commandPermissions.assertMemberIsTrusted, commandPermissions.assertCommandIsUsedInGameChannel);
    return subscribeToGameCommand;
}
function _behaviour(commandContext) {
    var gameObject = commandContext.getGameTargetedByCommand();
    var discordEnvironment = gameObject.getDiscordEnvironment();
    var gameRole = discordEnvironment.getDiscordJsRole();
    var guildMemberWrapper = commandContext.getSenderGuildMemberWrapper();
    return guildMemberWrapper.addRole(gameRole)
        .then(function () { return commandContext.respondToCommand("The game's role has been assigned to you."); });
}
//# sourceMappingURL=subscribe_to_game.js.map