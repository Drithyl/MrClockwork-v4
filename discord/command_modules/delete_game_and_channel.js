
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

    return commandContext.respondToCommand(`Deleting game...`)
    .then(() => gameObject.emitPromiseWithGameDataToServer("DELETE_GAME"))
    .then(() => ongoingGameStore.deleteGame(gameObject.getName()))
    .then(() => gameObject.deleteRole())
    .then(() => gameObject.deleteChannel());
}