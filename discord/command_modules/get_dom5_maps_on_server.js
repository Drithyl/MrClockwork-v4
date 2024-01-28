
const asserter = require("../../asserter.js");
const config = require("../../config/config.json");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const hostServerStore = require("../../servers/host_server_store.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("GET_MAPS_ON_SERVER");

module.exports = GetMapsOnServerCommand;

function GetMapsOnServerCommand()
{
    const getMapsOnServerCommand = new Command(commandData);

    getMapsOnServerCommand.addBehaviour(_behaviour);

    return getMapsOnServerCommand;
}

async function _behaviour(commandContext)
{
    const commandArguments = commandContext.getCommandArgumentsArray();
    const gameType = commandArguments[0];

    if (asserter.isValidGameType(gameType) === false)
        return commandContext.respondToCommand(new MessagePayload(`You must specify the game for which you want to get a list of maps. Either ${config.dom5GameTypeName} or ${config.dom6GameTypeName}`));

    const payload = new MessagePayload(`Attached below is the list of ${gameType} maps available:\n\n`);
    const maps = await hostServerStore.getMaps(gameType);
    var stringList = "";


    if (maps.length <= 0)
        return commandContext.respondToCommand(new MessagePayload(`No ${gameType} maps are available. You'll have to upload some with the corresponding command.`));

        
    maps.forEach((mapData) => 
    {
        stringList += `${(mapData.name).width(48)} (${mapData.land.toString().width(4)} land, ${mapData.sea.toString().width(3)} sea).\n`;
    });

    payload.setAttachment("maps.txt", Buffer.from(stringList));

    return commandContext.respondToCommand(payload);
}