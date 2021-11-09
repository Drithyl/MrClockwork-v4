
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("SWITCH_TIMER_ENFORCER");

module.exports = SwitchTimerEnforcerCommand;

function SwitchTimerEnforcerCommand()
{
    const switchTimerEnforcerCommand = new Command(commandData);

    switchTimerEnforcerCommand.addBehaviour(_behaviour);

    switchTimerEnforcerCommand.addRequirements(
        commandPermissions.assertMemberIsOrganizer,
        commandPermissions.assertGameIsOnline,
        commandPermissions.assertGameHasStarted,
        commandPermissions.assertCommandIsUsedInGameChannel
    );

    return switchTimerEnforcerCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();

    return gameObject.switchTimerEnforcer()
    .then((isBotNewEnforcer) =>
    {
        if (isBotNewEnforcer === true)
            commandContext.respondToCommand(new MessagePayload(`The timer is now enforced by the bot. The in-game timer will no longer appear, but it can always be seen in the game's pinned status embed post.`));
        
        else commandContext.respondToCommand(new MessagePayload(`The timer is now enforced by the game. The in-game timer will appear. You should double-check that the current timer is adequate.`));
    });
}