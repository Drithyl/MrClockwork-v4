
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const hostServerStore = require("../../servers/host_server_store.js");
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
    const commandArguments = commandContext.getCommandArgumentsArray();
    const targetedServerName = commandArguments[0];
    var targetedServerObject;

    if (targetedServerName == null)
        return commandContext.respondToCommand(new MessagePayload(`You must specify a server name from the ones available below:\n\n${hostServerStore.printListOfOnlineHostServers().toBox()}`));

    if (hostServerStore.hasHostServerByName(targetedServerName) === false)
        return commandContext.respondToCommand(new MessagePayload(`Selected server is does not exist.`));

    targetedServerObject = hostServerStore.getHostServerByName(targetedServerName);

    if (targetedServerObject.isOnline() === false)
        return commandContext.respondToCommand(new MessagePayload(`Selected server is offline.`));

    return getListOfModsOnServerAndSend(targetedServerObject, commandContext);
}

function getListOfModsOnServerAndSend(serverObject, commandContext)
{
    const payload = new MessagePayload("Below is the list of mods available:\n\n");

    return commandContext.respondToCommand(new MessagePayload(`Fetching mods, this may take a while...`))
    .then(() => serverObject.getDom5ModsOnServer())
    .then((list) =>
    {
        if (list.length <= 0)
            return commandContext.respondToCommand(new MessagePayload("No mods are available on this server."));

        payload.setAttachment("mods.txt", Buffer.from(list.join("\n")));
        return commandContext.respondToCommand(payload);
    });
} 