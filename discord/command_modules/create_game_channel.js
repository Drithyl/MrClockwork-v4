
const log = require("../../logger.js");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const pendingChannelStore = require("../pending_game_channel_store.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("CREATE_GAME_CHANNEL");

module.exports = CreateGameChannelCommand;

function CreateGameChannelCommand()
{
    const createGameChannelCommand = new Command(commandData);

    createGameChannelCommand.addBehaviour(_behaviour);

    createGameChannelCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted
    );

    return createGameChannelCommand;
}

function _behaviour(commandContext)
{
    const memberId = commandContext.getCommandSenderId();
    const guildWrapper = commandContext.getGuildWrapper();
    const commandArguments = commandContext.getCommandArgumentsArray();
    const nameOfChannel = commandArguments[0];

    return guildWrapper.createGameChannel(nameOfChannel)
    .then((channel) => 
    {
        return pendingChannelStore.addPendingChannel(memberId, channel.id)
        .then(() =>
        {
            log.general(log.getNormalLevel(), `The game channel ${channel.name} was created and added to the pending list.`);
            return commandContext.respondToCommand(new MessagePayload(`The channel ${channel} was created.`));
        });
    });
}