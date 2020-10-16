
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("SUBSCRIBE_TO_GAME");

module.exports = SubscribeToGameCommand;

function SubscribeToGameCommand()
{
    const subscribeToGameCommand = new Command(commandData);

    subscribeToGameCommand.addBehaviour(_behaviour);

    subscribeToGameCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertCommandIsUsedInGameChannel
    );

    return subscribeToGameCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const discordEnvironment = gameObject.getDiscordEnvironment();
    const gameRole = discordEnvironment.getDiscordJsRole();
    const guildMemberWrapper = commandContext.getSenderGuildMemberWrapper();

    return guildMemberWrapper.addRole(gameRole)
    .then(() => commandContext.respondToCommand(`The game's role has been assigned to you.`));
}