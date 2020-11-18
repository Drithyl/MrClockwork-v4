
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const webSessionsStore = require("../../servers/web_sessions_store.js");
const playerFileStore = require("../../player_data/player_file_store.js");

const commandData = new CommandData("CHANGE_PLAYER_PREFERENCES");

module.exports = ChangePlayerPreferencesCommand;

function ChangePlayerPreferencesCommand()
{
    const changePlayerPreferencesCommand = new Command(commandData);

    changePlayerPreferencesCommand.addBehaviour(_behaviour);

    changePlayerPreferencesCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted
    );

    return changePlayerPreferencesCommand;
}

function _behaviour(commandContext)
{
    return activeMenuStore.startChangePlayerPreferencesMenu(commandContext);
}