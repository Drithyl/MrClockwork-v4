
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const gamesStore = require("../../games/ongoing_games_store.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("PAUSE_ALL_GAMES");

module.exports = PauseAllCommand;

function PauseAllCommand()
{
    const pauseAllCommand = new Command(commandData);

    pauseAllCommand.addBehaviour(_behaviour);

    pauseAllCommand.addRequirements(
        commandPermissions.assertMemberIsDev
    );

    return pauseAllCommand;
}

function _behaviour(commandContext)
{
    const games = gamesStore.getArrayOfGames();
    
    games.forEach((game) =>
    {
        if (game.hasGameStarted() === true)
        {
            const lastKnownStatus = game.getLastKnownStatus();
            lastKnownStatus.setIsPaused(true);
        }
    });

    return commandContext.respondToCommand(new MessagePayload(`All started games have been paused.`));
}
