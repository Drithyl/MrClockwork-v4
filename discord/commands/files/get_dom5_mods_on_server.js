
const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const trustedServers = require("../../../config/trusted_server_data.json");
const hostServerStore = require("../../../servers/host_server_store.js");


const SERVER_NAME_OPTION = "server_name";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("mods")
		.setDescription("Prints a list of the Dominions 5 mods available to use.")
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
    const payload = new MessagePayload("Attached below is the list of mods available:\n\n");
    const mods = await hostServerStore.getDom5Mods();

    if (mods.length <= 0)
        return commandContext.respondToCommand(new MessagePayload("No mods are available. You'll have to upload some with the corresponding command."));

    payload.setAttachment("mods.txt", Buffer.from(mods.join("\n")));

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