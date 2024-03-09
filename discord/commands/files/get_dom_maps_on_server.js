
const config = require("../../../config/config.json");
const { SlashCommandBuilder } = require("discord.js");
const hostServerStore = require("../../../servers/host_server_store.js");
const MessagePayload = require("../../prototypes/message_payload.js");


const GAME_TYPE_OPTION = "game_type";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("maps")
		.setDescription("Prints a list of the Dominions 5 or 6 maps available to host.")
        .addStringOption(option =>
            option.setName(GAME_TYPE_OPTION)
            .setDescription("Whether to fetch Dominions 5 or Dominions 6 maps")
            .addChoices(
                { name: "Dominions 6", value: config.dom6GameTypeName },
                { name: "Dominions 5", value: config.dom5GameTypeName }
            )
			.setRequired(true)
        ),

	execute: behaviour
};

async function behaviour(commandContext)
{
    const gameType = commandContext.options.getString(GAME_TYPE_OPTION);
    const payload = new MessagePayload(`Attached below is the list of ${gameType} maps available:\n\n`);
    const maps = await hostServerStore.getMaps(gameType);
    let stringList = "";


    if (maps.length <= 0)
        return commandContext.respondToCommand(new MessagePayload(`No ${gameType} maps are available. You'll have to upload some with the corresponding command.`));

        
    maps.forEach((mapData) => 
    {
        stringList += `${(mapData.name).width(48)} (${mapData.land.toString().width(4)} land, ${mapData.sea.toString().width(3)} sea).\n`;
    });

    payload.setAttachment("maps.txt", Buffer.from(stringList));

    return commandContext.respondToCommand(payload);
}
