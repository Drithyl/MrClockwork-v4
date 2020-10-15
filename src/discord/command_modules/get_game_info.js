
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("GET_GAME_INFO");

module.exports = GetGameInfoCommand;

function GetGameInfoCommand()
{
    const getGameInfoCommand = new Command(commandData);

    getGameInfoCommand.addBehaviour(_behaviour);

    getGameInfoCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertMemberIsTrusted
    );

    return getGameInfoCommand;
}

function _behaviour(commandContext)
{
    const targetedGame = commandContext.getGameTargetedByCommand();

    return targetedGame.killProcess()
    .then(() => commandContext.respondToCommand(`The process has been killed.`))
    .catch((err) => commandContext.respondToCommand(`An error occurred; process could not be killed:\n\n${err.message}`));
}