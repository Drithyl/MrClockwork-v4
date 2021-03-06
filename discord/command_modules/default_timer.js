
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const TimeLeft = require("../../games/prototypes/time_left.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("DEFAULT_TIMER");

module.exports = DefaultTimerCommand;

function DefaultTimerCommand()
{
    const defaultTimerCommand = new Command(commandData);

    defaultTimerCommand.addBehaviour(_behaviour);

    defaultTimerCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertCommandIsUsedInGameChannel
    );

    return defaultTimerCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const commandArguments = commandContext.getCommandArgumentsArray();

    //No arguments, just checking timer
    if (commandArguments.length <= 0)
        return _sendDefaultTimer(gameObject, commandContext);
    
    return _changeDefaultTimer(gameObject, commandContext, commandArguments);
}

function _sendDefaultTimer(gameObject, commandContext)
{
    const gameSettings = gameObject.getSettingsObject();
    const timerSetting = gameSettings.getTimerSetting();
    const defaultTimeLeft = timerSetting.getValue();

    return commandContext.respondToCommand(`The default timer is ${defaultTimeLeft.printTimeLeft()}.`);
}

function _changeDefaultTimer(gameObject, commandContext, commandArguments)
{
    const timerChangeArg = commandArguments[0];
    const timeToSet = _extractTimeToSet(timerChangeArg, gameObject.getMsLeftPerTurn());
    const lastKnownTurnNumber = gameObject.getLastKnownStatus().getTurnNumber();

    if (lastKnownTurnNumber <= 0)
        return commandContext.respondToCommand(`Game is being setup in lobby.`);

    return gameObject.changeTimer(gameObject.getLastKnownStatus().getMsLeft(), timeToSet)
    .then(() =>
    {
        if (timeToSet <= 0)
            return commandContext.respondToCommand(`The time per turn has been paused. It may take a minute to update.`);

        else return commandContext.respondToCommand(`The time per turn was changed. It may take a minute to update.`);
    });
}

function _extractTimeToSet(timerChangeArg, msPerTurn)
{
    const isAddition = (_isTimerAddition(timerChangeArg)) ? true : false;
    const addedTimeLeft = TimeLeft.fromStringInput(timerChangeArg.replace(/\+/g, ""));

    if (isAddition === true)
        return msPerTurn + addedTimeLeft.getMsLeft();

    else return addedTimeLeft.getMsLeft();
}

function _isTimerAddition(timerChangeArg)
{
    return timerChangeArg.indexOf("+") === 0;
}