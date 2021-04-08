
const log = require("../../logger.js");
const assert = require("../../asserter.js");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("SET_LOG_LEVEL");

module.exports = SetLogLevelCommand;

function SetLogLevelCommand()
{
    const setLogLevelCommand = new Command(commandData);

    setLogLevelCommand.addBehaviour(_behaviour);

    setLogLevelCommand.addRequirements(
        commandPermissions.assertMemberIsDev
    );

    return setLogLevelCommand;
}

function _behaviour(commandContext)
{
    const commandArguments = commandContext.getCommandArgumentsArray();
    const logLevelArg = +commandArguments[0];

    if (assert.isInteger(logLevelArg) === false || logLevelArg < 0 || logLevelArg > 2)
        return commandContext.respondToCommand(`Log level is an integer from 0 to 2`);

    log.setLogLevel(logLevelArg);
    return commandContext.respondToCommand(`Log level set to ${log.getLogLevel()}.`);
}
