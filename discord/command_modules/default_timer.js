
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const TimeLeft = require("../../games/prototypes/time_left.js");
const commandPermissions = require("../command_permissions.js");
const dom5TcpQuery = require("../../games/prototypes/dominions5_tcp_query.js");

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

    return dom5TcpQuery(gameObject)
    .then((tcpQuery) =>
    {
        const currentTimeLeft = tcpQuery.getTimeLeft();

        if (tcpQuery.isInLobby() === true)
            return commandContext.respondToCommand(`Game is being setup in lobby.`);

        if (_isTimerAddition(timerChangeArg) === true)
            return _addToDefaultTimer(timerChangeArg, gameObject, currentTimeLeft)
            .then(() => commandContext.respondToCommand(`The default timer was added. It may take a minute to update.`));

        else
            return _changeDefaultTimerForGame(timerChangeArg, gameObject, currentTimeLeft)
            .then(() => commandContext.respondToCommand(`The default timer was changed. It may take a minute to update.`));
    })
}

function _isTimerAddition(timerChangeArg)
{
    return timerChangeArg.indexOf("+") === 0;
}

function _addToDefaultTimer(timerChangeArg, gameObject, currentTimeLeft)
{
    var newTimerStripped = timerChangeArg.replace(/\+/, "");
    var addedTimeLeft = TimeLeft.fromStringInput(newTimerStripped);

    return gameObject.emitPromiseWithGameDataToServer("CHANGE_TIMER", {
        timer: currentTimeLeft.getMsLeft() + addedTimeLeft.getMsLeft(),
        currentTimer: currentTimeLeft.getMsLeft()
    });
}

function _changeDefaultTimerForGame(timerChangeArg, gameObject, currentTimeLeft)
{
    var addedTimeLeft = TimeLeft.fromStringInput(timerChangeArg);

    return gameObject.emitPromiseWithGameDataToServer("CHANGE_TIMER", {
        timer: addedTimeLeft.getMsLeft() ,
        currentTimer: currentTimeLeft.getMsLeft()
    });
}