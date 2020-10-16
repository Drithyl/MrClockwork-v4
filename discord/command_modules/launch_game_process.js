
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("LAUNCH_GAME_PROCESS");

module.exports = LaunchGameProcessCommand;

function LaunchGameProcessCommand()
{
    const launchGameProcessCommand = new Command(commandData);

    launchGameProcessCommand.addBehaviour(_behaviour);

    launchGameProcessCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertServerIsOnline,
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertMemberIsOrganizer
    );

    return launchGameProcessCommand;
}

function _behaviour(commandContext)
{
    const targetedGame = commandContext.getGameTargetedByCommand();

    return commandContext.respondToCommand(`Launching process...`)
    .then(() => targetedGame.launchProcess())
    .then(() => commandContext.respondToCommand(`The process has been launched.`))
    .catch((err) => commandContext.respondToCommand(`An error occurred:\n\n${err.message}`));
}