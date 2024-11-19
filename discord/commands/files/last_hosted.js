const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const ongoingGamesStore = require("../../../games/ongoing_games_store.js");
const MessageEmbedBuilder = require("../../wrappers/message_embed_builder.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("last_hosted")
		.setDescription("Prints a list of hosted games in this guild, or all games if sent by DM, sorted by last turn date."),

	execute: behaviour
};

async function behaviour(commandContext)
{
    const guild = commandContext.guildWrapper;
    const sortedGames = _getGamesSortedByLastHosted();
    const stringList = "Find the list of turns ordered by time hosted below:\n\n";

    let sortedGuildGamesEmbeds;

    if (commandContext.isDm === true)
        return commandContext.respondToCommand(new MessagePayload(stringList, _printAllSortedGames(sortedGames), true, "```"));
        
    sortedGuildGamesEmbeds = _embedSortedGuildGames(sortedGames, guild);

    for (const embed of sortedGuildGamesEmbeds) {
        const payload = new MessagePayload(stringList).setEmbed(embed);
        await commandContext.respondToCommand(payload);
    }
}

function _getGamesSortedByLastHosted()
{
    const arrayOfOngoingGames = ongoingGamesStore.getArrayOfGames();

    arrayOfOngoingGames.sort((a, b) => 
    {
        const lastHostedA = a.getLastKnownStatus().getLastTurnTimestamp();
        const lastHostedB = b.getLastKnownStatus().getLastTurnTimestamp();

        return a.getName() - b.getName() && lastHostedB - lastHostedA;
    });

    return arrayOfOngoingGames;
}

function _printAllSortedGames(sortedGamesArray)
{
    let listStr = "";
    sortedGamesArray.forEach((game) => listStr += _formatLastHostedString(game));
    return listStr;
}

function _formatLastHostedString(game)
{
    const gameName = game.getName();
    const ip = `${game.getIp()}:${game.getPort()}`;

    const guild = game.getGuild();
    const guildName = guild.getName();

    const lastKnownStatus = game.getLastKnownStatus();
    const lastTurnUnixTimestamp = (parseInt(lastKnownStatus.getLastTurnTimestamp()) / 1000).toFixed(0);

    const server = game.getServer();
    const serverName = server.getName();

    return `${gameName.width(31)} ${guildName.width(20)} ${serverName.width(10)} ${ip.width(23)} <t:${lastTurnUnixTimestamp}:f>\n`;
}

function _embedSortedGuildGames(sortedGamesArray, guild)
{
    let lastAddedDate = "";
    const embedObjects = [buildEmbed()];
    const sortedGuildGames = sortedGamesArray.filter((game) => game.getGuildId() === guild.getId());

    sortedGuildGames.sort((a, b) => 
    {
        const aStarted = a.getLastKnownStatus().hasStarted();
        const bStarted = b.getLastKnownStatus().hasStarted();

        // Return 0 if both have same value; 1 if a is true, and -1 otherwise
        // to sort by false values first and true values after
        return (aStarted === bStarted)? 0 : aStarted? -1 : 1;
    });

    sortedGuildGames.forEach((game) =>
    {
        const entry = _getGameEntry(game);
        const lastKnownStatus = game.getLastKnownStatus();
        const lastHostedTimestamp = lastKnownStatus.getLastTurnTimestamp();
        const lastHostedDate = (lastHostedTimestamp != null) ? new Date(lastHostedTimestamp).toDateString() : "Not Started";

        //if a new field cannot fit because the embed hit the limit, create a new embed
        if (embedObjects.last().canFitField(lastAddedDate, entry) === false)
            embedObjects.push(buildEmbed());

        lastAddedDate = _addToEmbed(entry, embedObjects.last(), lastHostedDate, lastAddedDate);
    });
    
    return embedObjects;
}

function buildEmbed()
{
  const embed = new MessageEmbedBuilder()
    .setTitle("Games in this guild sorted by last turn date")
    .setColor("0099FF");

  return embed;
}

function _addToEmbed(entry, embed, lastHostedDate, lastDateAdded)
{
    //if the turn date is the same and the field value still has space,
    //merge it within the same field
    if (lastDateAdded === lastHostedDate && embed.canAddToLastFieldValue(entry) === true)
    {
        embed.addToLastFieldValue(entry);
        return lastDateAdded;
    }

    //otherwise create a new field entirely
    else
    {
        embed.addField(lastHostedDate, entry);
        return lastHostedDate;
    }
}

function _getGameEntry(game)
{
    const ip = `${game.getIp()}:${game.getPort()}`;
    const channel = game.getChannel();
    const server = game.getServer();
    const serverName = server.getName();
    const lastKnownStatus = game.getLastKnownStatus();

    let fieldValue = `\n${channel} \`${serverName} ${ip}`;

    if (lastKnownStatus.hasStarted() === false)
        fieldValue += " (not started)`";

    else fieldValue += "`"; //close code tag

    return fieldValue;
}
