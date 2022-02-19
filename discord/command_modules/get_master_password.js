
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("GET_MASTER_PASSWORD");

module.exports = GetMasterPasswordCommand;

function GetMasterPasswordCommand()
{
    const getMasterPasswordCommand = new Command(commandData);

    getMasterPasswordCommand.addBehaviour(_behaviour);

    getMasterPasswordCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertMemberIsOrganizer
    );

    return getMasterPasswordCommand;
}

function _behaviour(commandContext)
{
    const targetedGame = commandContext.getGameTargetedByCommand();
    const ip = targetedGame.getIp();
    const port = targetedGame.getPort();
    const settingsObject = targetedGame.getSettingsObject();
    const masterPasswordSetting = settingsObject.getMasterPasswordSetting();
    const masterPassword = masterPasswordSetting.getValue();

    return commandContext.respondToSender(new MessagePayload(`**${targetedGame.getName()}**'s (${ip}:${port}) master password is \`${masterPassword}\`.`));
}