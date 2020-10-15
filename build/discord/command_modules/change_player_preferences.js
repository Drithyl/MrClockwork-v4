"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var activeMenuStore = require("../../menus/active_menu_store.js");
var commandData = new CommandData("CHANGE_PLAYER_PREFERENCES");
module.exports = ChangePlayerPreferencesCommand;
function ChangePlayerPreferencesCommand() {
    var changePlayerPreferencesCommand = new Command(commandData);
    changePlayerPreferencesCommand.addBehaviour(_behaviour);
    changePlayerPreferencesCommand.addRequirements(commandPermissions.assertCommandIsUsedInGameChannel, commandPermissions.assertMemberIsTrusted, commandPermissions.assertMemberIsPlayer);
    return changePlayerPreferencesCommand;
}
function _behaviour(commandContext) {
    return activeMenuStore.startChangePlayerPreferencesMenu(commandContext);
}
//# sourceMappingURL=change_player_preferences.js.map