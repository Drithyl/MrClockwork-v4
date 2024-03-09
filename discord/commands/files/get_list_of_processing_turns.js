const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const ongoingGamesStore = require("../../../games/ongoing_games_store.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("processing")
		.setDescription("Prints currently processing turns, ordered by the time at which they started doing so."),

	execute: behaviour
};

function behaviour(commandContext)
{
    const games = ongoingGamesStore.getArrayOfGames();
    const gamesSortedByProcessingDate = _sortByProcessingTimestamp(games);
    const stringIntroduction = "Turns currently processing, ordered by oldest:\n\n";
    let stringListOfTurns = "";

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

        stringListOfTurns += `\n${name.width(33)} ` + timeStr.width(24) + " " + hostServerName.width(20) + `${ip}:${port.toString()}`.width(33);
    });

    return commandContext.respondToCommand(new MessagePayload(stringIntroduction, stringListOfTurns, true, "```"));
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