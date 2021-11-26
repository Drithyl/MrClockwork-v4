
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const hostServerStore = require("../../servers/host_server_store.js");
const { SemanticError } = require("../../errors/custom_errors.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("GET_DOM5_MODS_ON_SERVER");

module.exports = GetDom5ModsOnServerCommand;

function GetDom5ModsOnServerCommand()
{
    const getDom5ModsOnServerCommand = new Command(commandData);

    getDom5ModsOnServerCommand.addBehaviour(_behaviour);

    return getDom5ModsOnServerCommand;
}

function _behaviour(commandContext)
{
    var commandArguments = commandContext.getCommandArgumentsArray();
    var targetedServerName = commandArguments[0];
    var targetedServerObject;

    if (targetedServerName == null)
        throw new SemanticError(`You must specify a server name from the ones available below:`, hostServerStore.printListOfOnlineHostServers().toBox());

    if (hostServerStore.hasHostServerByName(targetedServerName) === false)
        return commandContext.respondToCommand(new MessagePayload(`Selected server is does not exist.`));

    targetedServerObject = hostServerStore.getHostServerByName(targetedServerName);

    if (targetedServerObject.isOnline() === false)
        return commandContext.respondToCommand(new MessagePayload(`Selected server is offline.`));

    return getListOfModsOnServerAndSend(targetedServerObject, commandContext);
}

function getListOfModsOnServerAndSend(serverObject, commandContext)
{
    var introductionString = "Below is the list of mods available:\n\n";
    var stringList = "";

    return serverObject.getDom5ModsOnServer()
    .then((list) =>
    {
        if (list.length <= 0)
            return commandContext.respondToCommand(new MessagePayload("No mods are available on this server."));

        list.forEach((modFilename) => stringList += `${modFilename}\n`);
        return commandContext.respondToCommand(new MessagePayload(introductionString, stringList.toBox(), true, "```"));
    });
}