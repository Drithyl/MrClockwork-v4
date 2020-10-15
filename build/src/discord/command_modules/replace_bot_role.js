"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("REPLACE_BOT_ROLE");
module.exports = ReplaceBotRoleCommand;
function ReplaceBotRoleCommand() {
    var replaceBotRoleCommand = new Command(commandData);
    replaceBotRoleCommand.addBehaviour(_behaviour);
    replaceBotRoleCommand.addRequirements(commandPermissions.assertMemberIsGuildOwner);
    return replaceBotRoleCommand;
}
function _behaviour(commandContext) {
    var guildWrapper = commandContext.getGuildWrapper();
    var commandArgumentsArray = commandContext.getCommandArgumentsArray();
    var idOfRoleToBeReplaced = commandArgumentsArray[0];
    var idOfRoleToTakeItsPlace = commandArgumentsArray[1];
    return guildWrapper.replaceRoleWith(idOfRoleToBeReplaced, idOfRoleToTakeItsPlace)
        .then(function () { return commandContext.respondToCommand("The role has been replaced."); })
        .catch(function (err) { return commandContext.respondToCommand("An error occurred:\n\n" + err.message); });
}
//# sourceMappingURL=replace_bot_role.js.map