
const config = require("../../../config/config.json");
const { SlashCommandBuilder } = require("discord.js");
const hostServerStore = require("../../../servers/host_server_store.js");
const MessagePayload = require("../../prototypes/message_payload.js");


const GAME_TYPE_OPTION = "game_type";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("mods")
		.setDescription("Prints a list of the Dominions 5 or 6 mods available to use.")
        .addStringOption(option =>
            option.setName(GAME_TYPE_OPTION)
            .setDescription("Whether to fetch Dominions 5 or Dominions 6 mods")
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
    const payload = new MessagePayload(`Attached below is the list of ${gameType} mods available:\n\n`);
    const mods = await hostServerStore.getMods(gameType);
    const modList = mods.map((mod) => mod.name);

    if (modList.length <= 0)
        return commandContext.respondToCommand(new MessagePayload(`No ${gameType} mods are available. You'll have to upload some with the corresponding command.`));

    payload.setAttachment("mods.txt", Buffer.from(modList.join("\n")));

    return commandContext.respondToCommand(payload);
}
