
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const activeMenuStore = require("../../menus/active_menu_store.js");

const commandData = new CommandData("CHANGE_PLAYER_PREFERENCES");

module.exports = ChangePlayerPreferencesCommand;

function ChangePlayerPreferencesCommand()
{
    const changePlayerPreferencesCommand = new Command(commandData);

    changePlayerPreferencesCommand.addBehaviour(_behaviour);

    changePlayerPreferencesCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertMemberIsPlayer
    );

    return changePlayerPreferencesCommand;
}

function _behaviour(commandContext)
{
    return activeMenuStore.startChangePlayerPreferencesMenu(commandContext);
}