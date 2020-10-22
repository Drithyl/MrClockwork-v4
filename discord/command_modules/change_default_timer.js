
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const Timer = require("../../games/prototypes/time_left.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("CHANGE_CURRENT_TIMER");

module.exports = ChangeDefaultTimerCommand;

function ChangeDefaultTimerCommand()
{
    const changeDefaultTimerCommand = new Command(commandData);

    changeDefaultTimerCommand.addBehaviour(_behaviour);

    changeDefaultTimerCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertCommandIsUsedInGameChannel
    );

    return changeDefaultTimerCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const commandArguments = commandContext.getCommandArgumentsArray();
    const newTimerAsString = commandArguments[0];

    return Promise.resolve()
    .then(() =>
    {
        if (isTimerAddedToDefaultTimer(newTimerAsString))
            addTimeToGameDefaultTimer(newTimerAsString, gameObject);

        else
            changeDefaultTimerForGame(newTimerAsString, gameObject);
    })
    .then(() => commandContext.respondToCommand(`The default timer was changed. It may take a minute to update.`));
}

function isTimerAddedToDefaultTimer(newTimerAsString)
{
    return newTimerAsString.indexOf("+") === 0;
}

function addTimeToGameDefaultTimer(newTimerAsString, gameObject)
{
    const newTimerStripped = newTimerAsString.replace(/\+/, "");
    const addedTimeLeft = Timer.parseTimeLeftToMs(newTimerStripped);

    const settingsObject = gameObject.getSettingsObject();
    const timerSetting = settingsObject.getTimerSetting();
    const timeLeft = timerSetting.getValue();

    return gameObject.emitPromiseToServer("CHANGE_DEFAULT_TIMER", { timer: timeLeft.getMsLeft() + addedTimeLeft.getMsLeft() });
}

function changeDefaultTimerForGame(newTimerAsString, gameObject)
{
    const addedTimeLeft = Timer.parseTimeLeftToMs(newTimerAsString);

    return gameObject.changeDefaultTimer("CHANGE_DEFAULT_TIMER", { timer: addedTimeLeft.getMsLeft() });
}