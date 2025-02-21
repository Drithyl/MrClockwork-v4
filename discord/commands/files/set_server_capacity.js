const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const hostServerStore = require("../../../servers/host_server_store.js");

const CAPACITY_OPTION = "capacity";
const SERVER_OPTION = "server";


module.exports = {
	data: new SlashCommandBuilder()
		.setName("set_server_capacity")
		.setDescription("Set the number of available game slots of a specific (or multiple) servers.")
        .addIntegerOption(option =>
            option.setName(CAPACITY_OPTION)
            .setDescription("Number of ascension points to set.")
            .setMinValue(1)
            .setRequired(true)
        )
        .addStringOption(option =>
            option.setName(SERVER_OPTION)
            .setDescription("Name or id of the server for which to set the capacity. All servers if not provided.")
            .setRequired(false)
        ),

	execute: behaviour,

    // This command will never be deployed globally; only to a private dev guild
    isDev: true
};

async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsDev(commandContext);
    
    const capacity = commandContext.options.getInteger(CAPACITY_OPTION);
    const targetServer = commandContext.options.getString(SERVER_OPTION);
    const success = await hostServerStore.setCapacity(capacity, targetServer);
    
    if (success === true) {
        return commandContext.respondToCommand(new MessagePayload(
            `Server game slots set to ${capacity}.`
        ));
    }

    else {
        return commandContext.respondToCommand(new MessagePayload(
            `No change was made.`
        ));
    }
}
