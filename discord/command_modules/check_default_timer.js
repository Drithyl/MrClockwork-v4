
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("CHECK_CURRENT_TIMER");

module.exports = CheckDefaultTimerCommand;

function CheckDefaultTimerCommand()
{
    const checkDefaultTimerCommand = new Command(commandData);

    checkDefaultTimerCommand.addBehaviour(_behaviour);

    checkDefaultTimerCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertCommandIsUsedInGameChannel
    );

    return checkDefaultTimerCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const currentTimerObject = gameObject.getCurrentTimerObject();

    return commandContext.respondToCommand(currentTimerObject.printDefaultTimer());
}