
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const TimeLeft = require("../../games/prototypes/time_left.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("PAUSE_GAME");

module.exports = PauseCommand;

function PauseCommand()
{
    const pauseCommand = new Command(commandData);

    pauseCommand.addBehaviour(_behaviour);

    pauseCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertGameIsOnline,
        commandPermissions.assertGameHasStarted,
        commandPermissions.assertMemberIsOrganizer
    );

    return pauseCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const lastKnownStatus = gameObject.getLastKnownStatus();
    const lastKnownTurnNumber = lastKnownStatus.getTurnNumber();

    if (lastKnownTurnNumber <= 0)
        return commandContext.respondToCommand(new MessagePayload(`Game is being setup in lobby.`));
    
    lastKnownStatus.setIsPaused(!lastKnownStatus.isPaused());

    if (lastKnownStatus.isPaused() === true)
        return commandContext.respondToCommand(new MessagePayload(`Game is now paused.`));

    else return commandContext.respondToCommand(new MessagePayload(`Game is now no longer paused, and there are ${lastKnownStatus.printTimeLeft()} left till next turn.`));
}
