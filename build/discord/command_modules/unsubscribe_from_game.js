"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("UNSUBSCRIBE_FROM_GAME");
module.exports = UnsubscribeFromGameCommand;
function UnsubscribeFromGameCommand() {
    var unsubscribeFromGameCommand = new Command(commandData);
    unsubscribeFromGameCommand.addBehaviour(_behaviour);
    unsubscribeFromGameCommand.addRequirements(commandPermissions.assertMemberIsTrusted, commandPermissions.assertCommandIsUsedInGameChannel);
    return unsubscribeFromGameCommand;
}
function _behaviour(commandContext) {
    var gameObject = commandContext.getGameTargetedByCommand();
    var discordEnvironment = gameObject.getDiscordEnvironment();
    var gameRole = discordEnvironment.getDiscordJsRole();
    var guildMemberWrapper = commandContext.getSenderGuildMemberWrapper();
    return guildMemberWrapper.removeRole(gameRole)
        .then(function () { return commandContext.respondToCommand("The game's role has been removed from you."); });
}
//# sourceMappingURL=unsubscribe_from_game.js.map