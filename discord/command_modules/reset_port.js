
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const gamesStore = require("../../games/ongoing_games_store.js");

const commandData = new CommandData("RESET_PORT");

module.exports = ResetPortCommand;

function ResetPortCommand()
{
    const resetPortCommand = new Command(commandData);

    resetPortCommand.addBehaviour(_behaviour);

    resetPortCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertServerIsOnline,
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertMemberIsOrganizer
    );

    return resetPortCommand;
}

function _behaviour(commandContext)
{
    const targetedGame = commandContext.getGameTargetedByCommand();
    const hostServer = targetedGame.getServer();
    const ongoingGames = gamesStore.getOngoingGamesOnServer(hostServer);
    const currentPort = targetedGame.getPort();
    const gameWithSamePort = ongoingGames.find((game) => game.getPort() === currentPort);

    if (gameWithSamePort == null || gameWithSamePort.getName() === targetedGame.getName())
        return commandContext.respondToCommand(`Current port ${currentPort} is free; no need to reset it.`);

    return targetedGame.emitPromiseWithGameDataToServer("RESET_PORT")
    .then((newPort) =>
    {
        targetedGame.setPort(newPort);
        return targetedGame.sendGameAnnouncement(`New port ${newPort} has been set. You will have to kill/launch the game manually for it to update.`);
    });
}