"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var activeMenuStore = require("../../menus/active_menu_store.js");
var commandData = new CommandData("CHANGE_SETTINGS");
module.exports = ChangeSettingsCommand;
function ChangeSettingsCommand() {
    var changeSettingsCommand = new Command(commandData);
    changeSettingsCommand.addBehaviour(_behaviour);
    changeSettingsCommand.addRequirements(commandPermissions.assertCommandIsUsedInGameChannel, commandPermissions.assertServerIsOnline, commandPermissions.assertMemberIsTrusted, commandPermissions.assertMemberIsOrganizer, commandPermissions.assertGameHasNotStarted);
    return changeSettingsCommand;
}
function _behaviour(commandContext) {
    return activeMenuStore.startChangeSettingsMenu(commandContext);
}
//# sourceMappingURL=change_settings.js.map