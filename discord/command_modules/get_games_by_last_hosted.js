
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const ongoingGamesStore = require("../../games/ongoing_games_store.js");
const MessageEmbedBuilder = require("../wrappers/message_embed_builder.js");

const commandData = new CommandData("GET_GAMES_BY_LAST_HOSTED");

module.exports = GetGamesByLastHostedCommand;

function GetGamesByLastHostedCommand()
{
    const getGamesByLastHostedCommand = new Command(commandData);

    getGamesByLastHostedCommand.addBehaviour(_behaviour);

    return getGamesByLastHostedCommand;
}

function _behaviour(commandContext)
{
    const guild = commandContext.getGuildWrapper();
    const channel = commandContext.getDestinationChannel();
    const sortedGames = _getGamesSortedByLastHosted();
    const stringList = "Find the list of turns ordered by time hosted below:\n\n";

    var sortedGuildGamesEmbeds;

    if (commandContext.wasSentByDm() === true)
        return commandContext.respondToCommand(`${stringList}:\n\n${_printAllSortedGames(sortedGames).toBox()}`, );
        
    sortedGuildGamesEmbeds = _embedSortedGuildGames(sortedGames, guild);
    
    return sortedGuildGamesEmbeds.forEachPromise((embed, i, nextPromise) => embed.sendTo(channel, stringList));
}

function _getGamesSortedByLastHosted()
{
    const arrayOfOngoingGames = ongoingGamesStore.getArrayOfGames();

    arrayOfOngoingGames.sort((a, b) => 
    {
        const lastHostedA = a.getLastKnownData().lastTurnTimestamp;
        const lastHostedB = b.getLastKnownData().lastTurnTimestamp;

        return a.getName() - b.getName() && lastHostedB - lastHostedA;
    });

    return arrayOfOngoingGames;
}

function _printAllSortedGames(sortedGamesArray)
{
    var listStr = "";
    sortedGamesArray.forEach((game) => listStr += _formatLastHostedString(game));
    return listStr;
}

function _embedSortedGuildGames(sortedGamesArray, guild)
{
    const embedObjects = [buildEmbed()];
    var currentEmbedIndex = 0;
    var currentLastHostedDate = "";

    for (var i = 0; i < sortedGamesArray.length; i++)
    {
        const game = sortedGamesArray[i];


        if (game.getGuildId() !== guild.getId())
            continue;


        const embed = embedObjects[currentEmbedIndex];

        const ip = `${game.getIp()}:${game.getPort()}`;
        const channel = game.getChannel();
        const server = game.getServer();
        const serverName = server.getName();

        const lastKnownData = game.getLastKnownData();
        const lastHostedDate = new Date(lastKnownData.lastTurnTimestamp).toDateString();

        var fieldValue = `\n${channel}\`${serverName} ${ip}`;


        if (lastKnownData.lastKnownTurnNumber <= 0)
            fieldValue += " (not started)`";

        else fieldValue += "`"; //close code tag


        //if a new field cannot fit because the embed hit the limit, create a new embed
        if (embed.canFitField(currentLastHostedDate, fieldValue) === false)
        {
            embedObjects.push(buildEmbed());
            currentEmbedIndex++;
            embed = embedObjects[currentEmbedIndex];
        }


        //if the turn date is the same and the field value still has space,
        //merge it within the same field
        if (currentLastHostedDate === lastHostedDate && embed.canAddToLastFieldValue(fieldValue) === true)
            embed.addToLastFieldValue(fieldValue);

        //otherwise create a new field entirely
        else
        {
            currentLastHostedDate = lastHostedDate;
            embed.addField(currentLastHostedDate, fieldValue);
        }
    }

    return embedObjects;
}

function _formatLastHostedString(game)
{
    const gameName = game.getName();
    const ip = `${game.getIp()}:${game.getPort()}`;

    const guild = game.getGuild();
    const guildName = guild.getName();

    const lastKnownData = game.getLastKnownData();
    const lastTurnTimestamp = lastKnownData.lastTurnTimestamp;

    const server = game.getServer();
    const serverName = server.getName();

    return `${gameName.width(32)} ${guildName.width(20)} ${serverName.width(10)} ${ip.width(23)} ${lastTurnTimestamp.toDateString()}\n`;
}

function buildEmbed()
{
  const embed = new MessageEmbedBuilder()
    .setTitle("Games in this guild sorted by last turn date")
    .setColor("0099FF");

  return embed;
}