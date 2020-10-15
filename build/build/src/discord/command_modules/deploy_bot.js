"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("DEPLOY_BOT");
module.exports = DeployBotCommand;
function DeployBotCommand() {
    var deployBotCommand = new Command(commandData);
    deployBotCommand.addBehaviour(_behaviour);
    deployBotCommand.addRequirements(commandPermissions.assertMemberIsGuildOwner, commandPermissions.assertBotHasPermissionToManageRoles, commandPermissions.assertBotHasPermissionToManageChannels);
    return deployBotCommand;
}
function _behaviour(commandContext) {
    var targetedGuild = commandContext.getGuildWrapper();
    return targetedGuild.deployBot()
        .then(function () { return commandContext.respondToCommand("The bot has been successfully deployed! You may rename or move around the roles, channels and categories created, but do not delete them! If one does get deleted, you can regenerate them by using this command again."); });
}
//# sourceMappingURL=deploy_bot.js.map