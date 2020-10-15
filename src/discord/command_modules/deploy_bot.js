
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("DEPLOY_BOT");

module.exports = DeployBotCommand;

function DeployBotCommand()
{
    const deployBotCommand = new Command(commandData);

    deployBotCommand.addBehaviour(_behaviour);

    deployBotCommand.addRequirements(
        commandPermissions.assertMemberIsGuildOwner,
        commandPermissions.assertBotHasPermissionToManageRoles,
        commandPermissions.assertBotHasPermissionToManageChannels
    );

    return deployBotCommand;
}

function _behaviour(commandContext)
{
    const targetedGuild = commandContext.getGuildWrapper();

    return targetedGuild.deployBot()
    .then(() => commandContext.respondToCommand(`The bot has been successfully deployed! You may rename or move around the roles, channels and categories created, but do not delete them! If one does get deleted, you can regenerate them by using this command again.`));
}