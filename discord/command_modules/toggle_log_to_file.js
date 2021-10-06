
const log = require("../../logger.js");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("TOGGLE_LOG_TO_FILE");

module.exports = ToggleLogToFileCommand;

function ToggleLogToFileCommand()
{
    const toggleLogToFileCommand = new Command(commandData);

    toggleLogToFileCommand.addBehaviour(_behaviour);

    toggleLogToFileCommand.addRequirements(
        commandPermissions.assertMemberIsDev
    );

    return toggleLogToFileCommand;
}

function _behaviour(commandContext)
{
    const result = log.toggleLogToFile();
    return commandContext.respondToCommand(`\`Log to file\` set to ${result}.`);
}
