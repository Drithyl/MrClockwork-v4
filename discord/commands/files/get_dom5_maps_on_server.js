const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const trustedServers = require("../../../config/trusted_server_data.json");
const hostServerStore = require("../../../servers/host_server_store.js");


const SERVER_NAME_OPTION = "server_name";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("maps")
		.setDescription("Prints a list of the Dominions 5 maps available to host.")
        .addStringOption(option =>
            option.setName(SERVER_NAME_OPTION)
            .setDescription("A server name if you wish to check one in particular.")
            .addChoices(...getStringOptionChoices())
        ),

	execute: behaviour
};

async function behaviour(commandContext)
{
    const serverName = commandContext.options.getString(SERVER_NAME_OPTION);
    const payload = new MessagePayload("Attached below is the list of maps available:\n\n");
    const maps = await hostServerStore.getDom5Maps();
    let stringList = "";


    if (maps.length <= 0)
        return commandContext.respondToCommand(new MessagePayload("No maps are available. You'll have to upload some with the corresponding command."));

        
    maps.forEach((mapData) => 
    {
        stringList += `${(mapData.name).width(48)} (${mapData.land.toString().width(4)} land, ${mapData.sea.toString().width(3)} sea).\n`
    });

    payload.setAttachment("maps.txt", Buffer.from(stringList));

    return commandContext.respondToCommand(payload);
}

function getStringOptionChoices()
{
    const choices = [];

    for (let id in trustedServers)
    {
        const serverData = trustedServers[id];
        choices.push({ name: serverData.name, value: id });
    }

    return choices;
}