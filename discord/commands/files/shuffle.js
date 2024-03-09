const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");


const LIST_OPTION_NAME = "list_to_shuffle";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("shuffle")
		.setDescription("Shuffles a list of space-separated elements, i.e. player names to create a draft order.")
        .addStringOption(option =>
            option.setName(LIST_OPTION_NAME)
            .setDescription("A space-separated list of things, i.e mentions or numbers")
            .setRequired(true)
        ),

	execute: behaviour
};


function behaviour(commandContext)
{
    const input = commandContext.options.getString(LIST_OPTION_NAME);
    const shuffledList = _shuffle(input.split(" "));
    return commandContext.respondToCommand(new MessagePayload(_list(shuffledList), "", true, "```"));
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