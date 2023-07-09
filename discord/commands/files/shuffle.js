const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");


const LIST_OPTION_NAME = "list_to_shuffle";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("shuffle")
		.setDescription("Shuffles a list of space-separated elements, i.e. mentions to members to create a draft order.")
        .addStringOption(option =>
            option.setName(LIST_OPTION_NAME)
            .setDescription("A space-separated list of things, i.e mentions or numbers")
            .setRequired(true)
        ),

	execute: behaviour
};


async function behaviour(commandContext)
{
    const members = await commandContext.getMentionedMembers();
    const input = commandContext.options.getString(LIST_OPTION_NAME);
    let elementsToShuffle = input;

    if (members != null && members.length > 0)
        elementsToShuffle = members.map((memberWrapper) => memberWrapper.getNameInGuild());
    
    elementsToShuffle = _shuffle(elementsToShuffle);
    return commandContext.respondToCommand(new MessagePayload(_list(elementsToShuffle).toBox(), "", true, "```"));
}


function _shuffle(array)
{
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {

        // Pick a remaining element...
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

function _list(array)
{
    let str = "";
    array.forEach((elem, i) => str += `${i}. \t${elem}\n`);
    return str;
}