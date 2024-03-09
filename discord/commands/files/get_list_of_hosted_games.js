const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const ongoingGamesStore = require("../../../games/ongoing_games_store.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("games")
		.setDescription("Prints a list of all hosted games in this Discord guild, or all games if the command is sent by DM."),

	execute: behaviour
};

async function behaviour(commandContext)
{
    const arrayOfOngoingGames = ongoingGamesStore.getArrayOfGames();
    const stringIntroduction = "Find the list of games below:\n\n";
    const promises = arrayOfOngoingGames.map(printGameStatus);
    const statusList = await Promise.allSettled(promises);
    const gameStringList = statusList.map((p) => {
        if (p.status === "fulfilled") {
            return p.value;
        }
    });

    return commandContext.respondToCommand(new MessagePayload(stringIntroduction, gameStringList.join("\n"), true, "```"));
}

async function printGameStatus(gameObject)
{
    const name = gameObject.getName();
    const ip = gameObject.getIp();
    const port = gameObject.getPort();
    const hostServer = gameObject.getServer();
    let statusString = `\n${name.width(33)} ` + `${ip}:${port.toString()}`.width(22);

    if (hostServer == null)
    {
        statusString += `${"Server Dead".width(28)} Offline`;
    }

    else if (hostServer.isOnline() === false)
    {
        statusString += `Server Offline (${hostServer.getName()})`.width(28) + " Offline";
    }

    else 
    {
        const isOnline = await gameObject.isOnlineCheck();
        const onlineString = (isOnline === true) ? "Online" : "Offline";
        statusString += `${hostServer.getName().width(28)} ${onlineString}`;
    }

    return statusString;
}
