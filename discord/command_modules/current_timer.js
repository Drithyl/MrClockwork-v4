
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const TimeLeft = require("../../games/prototypes/time_left.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");
const { PermissionsError } = require("../../errors/custom_errors.js");

const commandData = new CommandData("CURRENT_TIMER");

module.exports = CurrentTimerCommand;

function CurrentTimerCommand()
{
    const currentTimerCommand = new Command(commandData);

    currentTimerCommand.addBehaviour(_behaviour);

    currentTimerCommand.addRequirements(
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
    const lastKnownTurnNumber = lastKnownStatus.getTurnNumber();

    if (lastKnownTurnNumber <= 0)
        return commandContext.respondToCommand(new MessagePayload(`Game is being setup in lobby.`));

    if (commandArguments.length <= 0)
        return _sendCurrentTimer(commandContext, lastKnownStatus);
    
    return _changeCurrentTimer(gameObject, commandContext, commandArguments, lastKnownStatus);
}

function _sendCurrentTimer(commandContext, status)
{
    return commandContext.respondToCommand(new MessagePayload(`${status.printTimeLeft()} left till next turn.`));
}

function _changeCurrentTimer(gameObject, commandContext, commandArguments, lastKnownStatus)
{
    const timerChangeArg = commandArguments[0];
    const timeToSet = _extractTimeToSet(timerChangeArg, lastKnownStatus.getTimeLeft());

    if (commandContext.doesSenderHaveOrganizerPermissions() === false)
        return Promise.reject(new PermissionsError(`You must be the game organizer to change the timer.`));

    return gameObject.changeTimer(timeToSet)
    .then(() => commandContext.respondToCommand(new MessagePayload(`The timer was changed. There are now ${lastKnownStatus.printTimeLeft()} left till next turn.`)));
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
