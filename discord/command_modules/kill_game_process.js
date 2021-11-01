
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("KILL_GAME_PROCESS");

module.exports = KillGameProcessCommand;

function KillGameProcessCommand()
{
    const killGameProcessCommand = new Command(commandData);

    killGameProcessCommand.addBehaviour(_behaviour);

    killGameProcessCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertServerIsOnline,
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertMemberIsOrganizer
    );

    return killGameProcessCommand;
}

function _behaviour(commandContext)
{
    const targetedGame = commandContext.getGameTargetedByCommand();

    return commandContext.respondToCommand(new MessagePayload(`Killing process...`))
    .then(() => targetedGame.kill())
    .then(() => commandContext.respondToCommand(new MessagePayload(`The process has been killed.`)))
    .catch((err) => commandContext.respondToCommand(new MessagePayload(`An error occurred:\n\n${err.message}`)));
}