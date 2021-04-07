
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("GET_GAME_INFO");

module.exports = GetGameInfoCommand;

function GetGameInfoCommand()
{
    const getGameInfoCommand = new Command(commandData);

    getGameInfoCommand.addBehaviour(_behaviour);

    getGameInfoCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertMemberIsTrusted
    );

    return getGameInfoCommand;
}

function _behaviour(commandContext)
{
    const targetedGame = commandContext.getGameTargetedByCommand();
    const settingsObject = targetedGame.getSettingsObject();
    const organizerWrapper = targetedGame.getOrganizer();

    var info = `Ip: ${targetedGame.getIp()}:${targetedGame.getPort()}\nOrganizer:`;

    if (organizerWrapper == null)
        info += "No organizer set";

    else info += organizerWrapper.getUsername();

    info += "\n" + settingsObject.getPublicSettingsStringList();

    return commandContext.respondToSender(info.toBox());
}