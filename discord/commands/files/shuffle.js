const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const { parseDiscordId } = require("../../../utilities/parsing-utilities.js");
const { EMBED_COLOURS } = require("../../../constants/discord-constants.js");
const { codeBlock } = require("../../../utilities/formatting-utilities.js");


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


async function behaviour(commandContext)
{
    const input = commandContext.options.getString(LIST_OPTION_NAME);
    const parsedList = await _parseList(input, commandContext);
    const shuffledList = _shuffle(parsedList);
    return commandContext.respondToCommand(new MessagePayload().addEmbeds(_buildEmbed(shuffledList)));
}

async function _parseList(input, commandContext) {
    const parsedList = input.split(" ");

    for (let i = 0; i < parsedList.length; i++) {
        const item = parsedList[i];
        const parsedDiscordId = parseDiscordId(item);

        if (parsedDiscordId != null) {
            const member = await commandContext.guild.members.fetch(parsedDiscordId);
            parsedList[i] = member.displayName;
        }
    }

    return parsedList;
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

function _buildEmbed(shuffledList) {
    const embed = new EmbedBuilder()
        .setColor(EMBED_COLOURS.INFO)
        .setTitle(`Shuffled list:`)
        .setDescription(codeBlock(_list(shuffledList)))
        .setTimestamp(new Date());

    return embed;
}

function _list(array)
{
    let str = "";
    array.forEach((elem, i) => str += `${i}.`.padEnd(5) + `${elem}\n`);
    return str;
}
