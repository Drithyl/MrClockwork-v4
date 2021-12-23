
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

async function _behaviour(commandContext)
{
    const payload = new MessagePayload("Attached below is the list of mods available:\n\n");
    const mods = await hostServerStore.getDom5Mods();

    if (mods.length <= 0)
        return commandContext.respondToCommand(new MessagePayload("No mods are available. You'll have to upload some with the corresponding command."));

    payload.setAttachment("mods.txt", Buffer.from(mods.join("\n")));

    return commandContext.respondToCommand(payload);
}
