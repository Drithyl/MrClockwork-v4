
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("GET_GAME_INFO");

module.exports = GetGameInfoCommand;

function GetGameInfoCommand()
{
    const getGameInfoCommand = new Command(commandData);

    getGameInfoCommand.addBehaviour(_behaviour);

    getGameInfoCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel
    );

    return getGameInfoCommand;
}

function _behaviour(commandContext)
{
    const targetedGame = commandContext.getGameTargetedByCommand();
    const settingsObject = targetedGame.getSettingsObject();
    const organizerWrapper = targetedGame.getOrganizer();

    var info = `IP: ${targetedGame.getIp()}:${targetedGame.getPort()}\nServer: ${targetedGame.getServer().getName()}\n\nOrganizer: `;

    if (organizerWrapper == null)
        info += "No organizer set";

    else info += organizerWrapper.getUsername();

    info += "\n" + settingsObject.getPublicSettingsStringList();

    return commandContext.respondToSender(new MessagePayload(info.toBox()));
}