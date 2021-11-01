
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("REPLACE_BOT_ROLE");

module.exports = ReplaceBotRoleCommand;

function ReplaceBotRoleCommand()
{
    const replaceBotRoleCommand = new Command(commandData);

    replaceBotRoleCommand.addBehaviour(_behaviour);

    replaceBotRoleCommand.addRequirements(
        commandPermissions.assertMemberIsGuildOwner
    );

    return replaceBotRoleCommand;
}

function _behaviour(commandContext)
{
    const guildWrapper = commandContext.getGuildWrapper();
    const commandArgumentsArray = commandContext.getCommandArgumentsArray();
    const idOfRoleToBeReplaced = commandArgumentsArray[0];
    const idOfRoleToTakeItsPlace = commandArgumentsArray[1];

    return guildWrapper.replaceRoleWith(idOfRoleToBeReplaced, idOfRoleToTakeItsPlace)
    .then(() => commandContext.respondToCommand(new MessagePayload(`The role has been replaced.`)))
    .catch((err) => commandContext.respondToCommand(new MessagePayload(`An error occurred:\n\n${err.message}`)));
}