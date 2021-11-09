
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("UNDEPLOY_BOT");

module.exports = UndeployBotCommand;

function UndeployBotCommand()
{
    const undeployBotCommand = new Command(commandData);

    undeployBotCommand.addBehaviour(_behaviour);

    undeployBotCommand.addRequirements(
        commandPermissions.assertMemberIsGuildOwner,
        commandPermissions.assertBotHasPermissionToManageRoles,
        commandPermissions.assertBotHasPermissionToManageChannels
    );

    return undeployBotCommand;
}

function _behaviour(commandContext)
{
    const targetedGuild = commandContext.getGuildWrapper();

    return targetedGuild.undeployBot()
    .then(() => commandContext.respondToCommand(new MessagePayload(`Cleaning of the bot roles and channels will be performed.`)));
}