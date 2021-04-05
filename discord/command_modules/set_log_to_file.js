
const log = require("../../logger.js");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("SET_LOG_TO_FILE");

module.exports = SetLogToFileCommand;

function SetLogToFileCommand()
{
    const setLogToFileCommand = new Command(commandData);

    setLogToFileCommand.addBehaviour(_behaviour);

    setLogToFileCommand.addRequirements(
        commandPermissions.assertMemberIsDev
    );

    return setLogToFileCommand;
}

function _behaviour(commandContext)
{
    const commandArguments = commandContext.getCommandArgumentsArray();
    const logToFileArg = commandArguments[0];

    if (/^0|(FALSE)$/i.test(logToFileArg) === true)
        log.setLogToFile(false);

    else if (/^1|(TRUE)$/i.test(logToFileArg) === true)
        log.setLogToFile(true);

    else return commandContext.respondToCommand("Argument must be `0` or `1`, or `false` or `true`.");

    return commandContext.respondToCommand(`\`Log to file\` set to ${log.isLoggingToFile()}.`);
}
