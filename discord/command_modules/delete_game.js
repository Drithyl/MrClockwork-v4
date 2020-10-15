
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const { deleteGameChannelPendingHosting } = require("../game_channels_pending_hosting_store.js");

const commandData = new CommandData("DELETE_GAME");

module.exports = DeleteGameCommand;

function DeleteGameCommand()
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
    if (commandContext.isChannelPendingHosting() === true)
        return deletePendingGameChannel(commandContext);

    else if (commandContext.isGameCommand() === true)
        return deleteGame(commandContext);
}

function deletePendingGameChannel(commandContext)
{
    var channelObject = commandContext.getDestinationChannel();
    var channelId = channelObject.id;

    return deleteGameChannelPendingHosting(channelId);
}

function deleteGame(commandContext)
{
    var gameObject = commandContext.getGameTargetedByCommand();

    return gameObject.delete();
}