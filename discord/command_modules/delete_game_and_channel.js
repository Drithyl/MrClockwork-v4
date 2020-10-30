
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const ongoingGameStore = require("../../games/ongoing_games_store.js");

const commandData = new CommandData("DELETE_GAME_AND_CHANNEL");

module.exports = DeleteGameAndChannelCommand;

function DeleteGameAndChannelCommand()
{
    const deleteGameCommand = new Command(commandData);

    deleteGameCommand.addBehaviour(_behaviour);

    deleteGameCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertMemberIsOrganizer
    );

    return deleteGameCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const gameChannel = gameObject.getChannel();
    const gameRole = gameObject.getRole();

    return gameObject.emitPromiseWithGameDataToServer("DELETE_GAME")
    .then(() => ongoingGameStore.deleteGame(gameObject.getName()))
    .then(() =>
    {
        if (gameRole != null)
            return gameRole.delete();

        else return Promise.resolve();
    })
    .then(() => gameChannel.delete())
    .then(() => commandContext.respondToCommand())
}