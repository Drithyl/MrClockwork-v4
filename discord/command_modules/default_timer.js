
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const TimeLeft = require("../../games/prototypes/time_left.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("DEFAULT_TIMER");

module.exports = DefaultTimerCommand;

function DefaultTimerCommand()
{
    const defaultTimerCommand = new Command(commandData);

    defaultTimerCommand.addBehaviour(_behaviour);

    defaultTimerCommand.addRequirements(
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

    return commandContext.respondToCommand(new MessagePayload(`The default timer is ${defaultTimeLeft.printTimeLeft()}.`));
}

function _changeDefaultTimer(gameObject, commandContext, commandArguments)
{
    const timerChangeArg = commandArguments[0];
    const timeToSet = _extractTimeToSet(timerChangeArg, gameObject.getMsLeftPerTurn());
    const lastKnownStatus = gameObject.getLastKnownStatus();
    const lastKnownTurnNumber = lastKnownStatus.getTurnNumber();
    const settingsObject = gameObject.getSettingsObject();
    const timerSetting = settingsObject.getTimerSetting();

    if (commandContext.doesSenderHaveOrganizerPermissions() === false)
        return Promise.reject(new PermissionsError(`You must be the game organizer to change the timer.`));

    if (lastKnownTurnNumber <= 0)
        return commandContext.respondToCommand(new MessagePayload(`Game is being setup in lobby.`));

    return gameObject.changeTimer(gameObject.getLastKnownStatus().getMsLeft(), timeToSet)
    .then(() =>
    {
        if (timeToSet <= 0)
            return commandContext.respondToCommand(new MessagePayload(`The time per turn has been paused. It may take a minute to update.`));

        else return commandContext.respondToCommand(new MessagePayload(`The time per turn was changed. New turns will now have ${timerSetting.getValue().printTimeLeft()}.`));
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