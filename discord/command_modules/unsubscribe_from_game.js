
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("UNSUBSCRIBE_FROM_GAME");

module.exports = UnsubscribeFromGameCommand;

function UnsubscribeFromGameCommand()
{
    const unsubscribeFromGameCommand = new Command(commandData);

    unsubscribeFromGameCommand.addBehaviour(_behaviour);

    unsubscribeFromGameCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertCommandIsUsedInGameChannel
    );

    return unsubscribeFromGameCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const gameRole = gameObject.getRole();
    const guildMemberWrapper = commandContext.getSenderGuildMemberWrapper();

    return guildMemberWrapper.removeRole(gameRole)
    .then(() => commandContext.respondToCommand(new MessagePayload(`The game's role has been removed from you.`)));
}