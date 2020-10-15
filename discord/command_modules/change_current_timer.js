
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const Timer = require("../../time_left_prototype");

const commandData = new CommandData("CHANGE_CURRENT_TIMER");

module.exports = ChangeCurrentTimerCommand;

function ChangeCurrentTimerCommand()
{
    const changeCurrentTimerCommand = new Command(commandData);

    changeCurrentTimerCommand.addBehaviour(_behaviour);

    changeCurrentTimerCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertCommandIsUsedInGameChannel
    );

    return changeCurrentTimerCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const commandArguments = commandContext.getCommandArgumentsArray();
    const newTimerAsString = commandArguments[0];

    return Promise.resolve()
    .then(() =>
    {
        if (isTimerAddedToCurrentTimer(newTimerAsString))
            addTimeToGame(newTimerAsString, gameObject);

        else
            changeTimerForGame(newTimerAsString, gameObject);
    })
    .then(() => commandContext.respondToCommand(`The timer was changed. It may take a minute to update.`));
}

function isTimerAddedToCurrentTimer(newTimerAsString)
{
    return newTimerAsString.indexOf("+") === 0;
}

function addTimeToGame(newTimerAsString, gameObject)
{
    var newTimerStripped = newTimerAsString.replace(/\+/, "");
    var newTimerInMs = Timer.parseTimeLeftToMs(newTimerStripped);

    return gameObject.addTimeToCurrentTimer(newTimerInMs);
}

function changeTimerForGame(newTimerAsString, gameObject)
{
    var newTimerInMs = Timer.parseTimeLeftToMs(newTimerAsString);

    return gameObject.changeCurrentTimer(newTimerInMs);
}