const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const hostServerStore = require("../../../servers/host_server_store.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("capacity")
		.setDescription("Prints the list of servers with the number of free hosting slots in each."),

	execute: behaviour
};

function behaviour(commandContext)
{
    const introductionString = "Below is the list of available slots per server:\n\n";
    const stringListOfFreeSlots = hostServerStore.printListOfFreeSlots();

    if (hostServerStore.hasServersOnline() === false)
        return commandContext.respondToCommand(new MessagePayload(`There are no servers online.`));

    return commandContext.respondToCommand(new MessagePayload(introductionString, stringListOfFreeSlots, true, "```")); 
}
