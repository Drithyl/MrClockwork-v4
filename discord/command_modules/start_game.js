
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("START_GAME");

module.exports = StartGameCommand;

function StartGameCommand()
{
    const startGameCommand = new Command(commandData);

    startGameCommand.addBehaviour(_behaviour);

    startGameCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertServerIsOnline,
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertMemberIsOrganizer
    );

    return startGameCommand;
}

function _behaviour(commandContext)
{
    const targetedGame = commandContext.getGameTargetedByCommand();

    return targetedGame.startGame()
    .then(() => commandContext.respondToCommand(`The game has started setup process. Depending on the map and players, it may take a significant amount of time.`))
    .catch((err) => commandContext.respondToCommand(`An error occurred:\n\n${err.message}`));
}