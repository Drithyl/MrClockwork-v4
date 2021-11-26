
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const ongoingGamesStore = require("../../games/ongoing_games_store.js");
const MessageEmbedBuilder = require("../wrappers/message_embed_builder.js");
const MessagePayload = require("../prototypes/message_payload.js");

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
    const sortedGames = _getGamesSortedByLastHosted();
    const stringList = "Find the list of turns ordered by time hosted below:\n\n";

    var sortedGuildGamesEmbeds;

    if (commandContext.wasSentByDm() === true)
        return commandContext.respondToCommand(new MessagePayload(stringList, _printAllSortedGames(sortedGames).toBox(), true, "```"));
        
    sortedGuildGamesEmbeds = _embedSortedGuildGames(sortedGames, guild);
    
    return sortedGuildGamesEmbeds.forEachPromise((embed, i, nextPromise) => 
    {
        const payload = new MessagePayload(stringList).setEmbed(embed);
        return commandContext.respondToCommand(payload)
        .then(() => nextPromise());
    });
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
    var listStr = "";
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
    const lastTurnTimestampDate = new Date(lastKnownStatus.getLastTurnTimestamp()).toDateString();

    const server = game.getServer();
    const serverName = server.getName();

    return `${gameName.width(32)} ${guildName.width(20)} ${serverName.width(10)} ${ip.width(23)} ${lastTurnTimestampDate}\n`;
}

function _embedSortedGuildGames(sortedGamesArray, guild)
{
    var lastAddedDate = "";
    const embedObjects = [buildEmbed()];
    const sortedGuildGames = sortedGamesArray.filter((game) => game.getGuildId() === guild.getId());

    sortedGuildGames.sort((a, b) => 
    {
        const aStarted = a.getLastKnownStatus().isInLobby();
        const bStarted = b.getLastKnownStatus().isInLobby();

        // Return 0 if both have same value; 1 if a is true, and -1 otherwise
        // to sort by false values first and true values after
        return (aStarted === bStarted)? 0 : aStarted? 1 : -1;
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

    var fieldValue = `\n${channel}\`${serverName} ${ip}`;

    if (lastKnownStatus.isInLobby() === true)
        fieldValue += " (not started)`";

    else fieldValue += "`"; //close code tag

    return fieldValue;
}