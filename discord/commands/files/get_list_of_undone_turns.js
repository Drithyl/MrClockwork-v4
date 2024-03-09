const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");
const assert = require("../../../asserter.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("undone")
		.setDescription("In a game channel, prints a list nations whose turns' are undone or unfinished."),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);
    await commandPermissions.assertGameHasStarted(commandContext);

    let latestTimestamp;
    let messageString;
    let listString = "";
    let unfinishedTurns;
    let uncheckedTurns;

    const gameObject = commandContext.targetedGame;
    const status = gameObject.getLastKnownStatus();

    if (status == null)
        return commandContext.respondToCommand(new MessagePayload(`Game status is currently unavailable`));

    unfinishedTurns = status.getUnfinishedTurns();
    uncheckedTurns = status.getUncheckedTurns();
    latestTimestamp = _getLatestUpdateTimestamp(status);

    if (uncheckedTurns == null || unfinishedTurns == null || assert.isInteger(latestTimestamp) === false)
        return commandContext.respondToCommand(new MessagePayload(`Undone turn data is currently unavailable`));

    messageString = `Current time left: ${status.printTimeLeft()}. Below is the list of undone turns (last successful check: **${new Date(latestTimestamp).toTimeString()}**):\n\n`;

    if (unfinishedTurns.length > 0)
    {
        listString = "**Unfinished:**\n\n```";
        listString += unfinishedTurns.reduce((finalStr, nationName) => finalStr + `${nationName}\n`, "\n");
        listString += "```\n";
    }

    if (uncheckedTurns.length > 0)
    {
        listString += "**Unchecked:**\n\n```";
        listString += uncheckedTurns.reduce((finalStr, nationName) => finalStr + `${nationName}\n`, "\n");
        listString += "```\n";
    }

    return commandContext.respondToCommand(new MessagePayload(messageString, listString, true, "```"));
}

function _getLatestUpdateTimestamp(lastKnownStatus)
{
    const lastUpdateTimestamp = lastKnownStatus.getLastUpdateTimestamp();
    const successfulCheckTimestamp = lastKnownStatus.getSuccessfulCheckTimestamp();
    
    if (assert.isInteger(lastUpdateTimestamp) === false && assert.isInteger(successfulCheckTimestamp) === false)
        return null;

    if (assert.isInteger(successfulCheckTimestamp) === false)
        return lastUpdateTimestamp;

    if (assert.isInteger(lastUpdateTimestamp) === false)
        return successfulCheckTimestamp;

    else return Math.max(lastUpdateTimestamp, successfulCheckTimestamp);
}