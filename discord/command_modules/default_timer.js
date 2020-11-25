
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
    const { lastKnownTurnNumber } = gameObject.getLastKnownData();

    if (lastKnownTurnNumber <= 0)
        return commandContext.respondToCommand(`Game is being setup in lobby.`);

    if (_isTimerAddition(timerChangeArg) === true)
        return _addToDefaultTimer(timerChangeArg, gameObject)
        .then(() => commandContext.respondToCommand(`The default timer was added. It may take a minute to update.`));

    else
        return _changeDefaultTimerForGame(timerChangeArg, gameObject)
        .then(() => commandContext.respondToCommand(`The default timer was changed. It may take a minute to update.`));
}

function _isTimerAddition(timerChangeArg)
{
    return timerChangeArg.indexOf("+") === 0;
}

function _addToDefaultTimer(timerChangeArg, gameObject)
{
    const newTimerStripped = timerChangeArg.replace(/\+/, "");
    const addedTimeLeft = TimeLeft.fromStringInput(newTimerStripped);
    const settingsObject = gameObject.getSettingsObject();
    const timerSetting = settingsObject.getTimerSetting();
    const { lastKnownMsLeft } = gameObject.getLastKnownData();
    const newMsLeft = lastKnownMsLeft + addedTimeLeft.getMsLeft();

    return gameObject.emitPromiseWithGameDataToServer("CHANGE_TIMER", { timer: newMsLeft })
    .then(() =>
    {
        /** update setting value */
        timerSetting.fromJSON(newMsLeft);
        return Promise.resolve();
    });
}

function _changeDefaultTimerForGame(timerChangeArg, gameObject)
{
    const addedTimeLeft = TimeLeft.fromStringInput(timerChangeArg);
    const settingsObject = gameObject.getSettingsObject();
    const timerSetting = settingsObject.getTimerSetting();

    return gameObject.emitPromiseWithGameDataToServer("CHANGE_TIMER", { timer: addedTimeLeft.getMsLeft() })
    .then(() =>
    {
        /** update setting value */
        timerSetting.fromJSON(addedTimeLeft.getMsLeft());
        return Promise.resolve();
    });
}