
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("SUBSCRIBE_TO_GAME");

module.exports = SubscribeToGameCommand;

function SubscribeToGameCommand()
{
    const subscribeToGameCommand = new Command(commandData);

    subscribeToGameCommand.addBehaviour(_behaviour);

    subscribeToGameCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel
    );

    return subscribeToGameCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const gameRole = gameObject.getRole();
    const guildMemberWrapper = commandContext.getSenderGuildMemberWrapper();

    if (gameRole == null)
        return commandContext.respondToCommand(new MessagePayload(`This game's role does not exist; cannot assign it.`));

    return guildMemberWrapper.addRole(gameRole)
    .then(() => commandContext.respondToCommand(new MessagePayload(`The game's role has been assigned to you.`)));
}