
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("LAUNCH_GAME_PROCESS");

module.exports = LaunchGameProcessCommand;

function LaunchGameProcessCommand()
{
    const launchGameProcessCommand = new Command(commandData);

    launchGameProcessCommand.addBehaviour(_behaviour);

    launchGameProcessCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertServerIsOnline,
        commandPermissions.assertGameIsOffline,
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertMemberIsOrganizer
    );

    return launchGameProcessCommand;
}

function _behaviour(commandContext)
{
    const targetedGame = commandContext.getGameTargetedByCommand();

    return commandContext.respondToCommand(new MessagePayload(`Launching process...`))
    .then(() => targetedGame.launch())
    .then(() => commandContext.respondToCommand(new MessagePayload(`The process has been launched. It might take a couple of minutes to load the game.`)))
    .catch((err) => commandContext.respondToCommand(new MessagePayload(`An error occurred:\n\n${err.message}`)));
}