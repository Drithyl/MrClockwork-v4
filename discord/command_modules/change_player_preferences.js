
const config = require("../../config/config.json");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

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
    return commandContext.respondToCommand(`You can change your preferences by accessing the bot's website at ${config.fullSecureUrl}`);
}