
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("CHECK_CURRENT_TIMER");

module.exports = CheckCurrentTimerCommand;

function CheckCurrentTimerCommand()
{
    const checkCurrentTimerCommand = new Command(commandData);

    checkCurrentTimerCommand.addBehaviour(_behaviour);

    checkCurrentTimerCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertCommandIsUsedInGameChannel
    );

    return checkCurrentTimerCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const currentTimerObject = gameObject.getCurrentTimerObject();
    const timeLeftAsString = currentTimerObject.printTimeLeft();

    return commandContext.respondToCommand(timeLeftAsString);
}