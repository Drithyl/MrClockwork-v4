
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const TimeLeft = require("../../games/prototypes/time_left.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("CURRENT_TIMER");

module.exports = CurrentTimerCommand;

function CurrentTimerCommand()
{
    const currentTimerCommand = new Command(commandData);

    currentTimerCommand.addBehaviour(_behaviour);

    currentTimerCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertGameIsOnline,
        commandPermissions.assertGameHasStarted,
        commandPermissions.assertCommandIsUsedInGameChannel
    );

    return currentTimerCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const commandArguments = commandContext.getCommandArgumentsArray();
    const lastKnownStatus = gameObject.getLastKnownStatus();
    const lastKnownMsLeft = lastKnownStatus.getMsLeft();
    const lastKnownTurnNumber = lastKnownStatus.getTurnNumber();
    const timeLeft = new TimeLeft(lastKnownMsLeft);

    if (lastKnownTurnNumber <= 0)
        return commandContext.respondToCommand(`Game is being setup in lobby.`);

    if (commandArguments.length <= 0)
        return _sendCurrentTimer(commandContext, timeLeft);
    
    return _changeCurrentTimer(gameObject, commandContext, commandArguments, timeLeft);
}

function _sendCurrentTimer(commandContext, timeLeft)
{
    return commandContext.respondToCommand(timeLeft.printTimeLeft());
}

function _changeCurrentTimer(gameObject, commandContext, commandArguments, timeLeft)
{
    const timerChangeArg = commandArguments[0];
    const timeToSet = _extractTimeToSet(timerChangeArg, timeLeft);

    if (gameObject.isEnforcingTimer() === true && timeToSet > 0)
        gameObject.getLastKnownStatus().setMsLeft(timeToSet);

    return gameObject.changeTimer(timeToSet)
    .then(() =>
    {
        if (timeToSet <= 0)
            return commandContext.respondToCommand(`The timer has been paused. It may take a minute to update.`);

        else return commandContext.respondToCommand(`The timer was changed. It may take a minute to update.`);
    });
}

function _extractTimeToSet(timerChangeArg, timeLeft)
{
    const isAddition = (_isTimerAddition(timerChangeArg)) ? true : false;
    const addedTimeLeft = TimeLeft.fromStringInput(timerChangeArg.replace(/\+/g, ""));

    if (isAddition === true)
        return timeLeft.getMsLeft() + addedTimeLeft.getMsLeft();

    else return addedTimeLeft.getMsLeft();
}

function _isTimerAddition(timerChangeArg)
{
    return timerChangeArg.indexOf("+") === 0;
}
