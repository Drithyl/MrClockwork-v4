
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const ongoingGamesStore = require("../../games/ongoing_games_store.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("GET_LIST_OF_PROCESSING_TURNS");

module.exports = GetListOfProcessingTurnsCommand;

function GetListOfProcessingTurnsCommand()
{
    const getListOfProcessingTurnsCommand = new Command(commandData);

    getListOfProcessingTurnsCommand.addBehaviour(_behaviour);

    return getListOfProcessingTurnsCommand;
}

function _behaviour(commandContext)
{
    const games = ongoingGamesStore.getArrayOfGames();
    const gamesSortedByProcessingDate = _sortByProcessingTimestamp(games);
    const stringIntroduction = "Turns currently processing, ordered by oldest:\n\n";
    var stringListOfTurns = "";

    if (gamesSortedByProcessingDate.length <= 0)
        return commandContext.respondToCommand(new MessagePayload(`No turns are currently being processed.`));

    gamesSortedByProcessingDate.forEach((gameObject) =>
    {
        const name = gameObject.getName();
        const ip = gameObject.getIp();
        const port = gameObject.getPort();
        const hostServer = gameObject.getServer();
        const hostServerName = hostServer.getName();
        const status = gameObject.getLastKnownStatus();
        const startedAt = status.getTurnStartProcessingTimestamp();
        const timeStr = new Date(startedAt).toString();

        stringListOfTurns += `\n${name.width(33)} ` + timeStr.width(24) + hostServerName.width(20) + `${ip}:${port.toString()}`.width(33);
    });

    return commandContext.respondToCommand(new MessagePayload(stringIntroduction, stringListOfTurns.toBox(), true, "```"));
}

function _sortByProcessingTimestamp(games)
{
    const processingGames = games.filter((game) => game.getLastKnownStatus().isTurnProcessing() === true);
    processingGames.sort((a, b) =>
    {
        const statusA = a.getLastKnownStatus();
        const statusB = b.getLastKnownStatus();
        return statusA.getTurnStartProcessingTimestamp() - statusB.getTurnStartProcessingTimestamp();
    });

    return processingGames;
}