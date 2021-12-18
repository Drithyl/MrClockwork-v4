
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const hostServerStore = require("../../servers/host_server_store.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("GET_DOM5_MAPS_ON_SERVER");

module.exports = GetDom5MapsOnServerCommand;

function GetDom5MapsOnServerCommand()
{
    const getDom5MapsOnServerCommand = new Command(commandData);

    getDom5MapsOnServerCommand.addBehaviour(_behaviour);

    return getDom5MapsOnServerCommand;
}

async function _behaviour(commandContext)
{
    const payload = new MessagePayload("Attached below is the list of maps available:\n\n");
    const maps = await hostServerStore.getDom5Maps();
    var stringList = "";


    if (maps.length <= 0)
        return commandContext.respondToCommand(new MessagePayload("No maps are available. You'll have to upload some with the corresponding command."));

        
    maps.forEach((mapData) => 
    {
        stringList += `${(mapData.name).width(48)} (${mapData.land.toString().width(4)} land, ${mapData.sea.toString().width(3)} sea).\n`
    });

    payload.setAttachment("maps.txt", Buffer.from(stringList));

    return commandContext.respondToCommand(payload);
}