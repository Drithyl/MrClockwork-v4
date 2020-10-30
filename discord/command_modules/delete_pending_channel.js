
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const pendingChannelStore = require("../pending_game_channel_store.js");

const commandData = new CommandData("DELETE_PENDING_CHANNEL");

module.exports = DeleteGameCommand;

function DeleteGameCommand()
{
    const deleteGameCommand = new Command(commandData);

    deleteGameCommand.addBehaviour(_behaviour);

    deleteGameCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
    );

    return deleteGameCommand;
}

function _behaviour(commandContext)
{
    const memberId = commandContext.getCommandSenderId();
    const channel = commandContext.getDestinationChannel();
    const channelId = channel.id;

    if (pendingChannelStore.isChannelPendingHosting(channelId) === true &&
        pendingChannelStore.didMemberCreatePendingChannel(memberId, channelId) === true)
    {
        return channel.delete()
        .then(() => pendingChannelStore.removeGameChannelPendingHosting(channelId));
    }

    else return commandContext.respondToCommand(`This is not a game channel.`);
}