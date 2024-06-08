const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");
const assert = require("../../../asserter.js");
const { dateToUnixTimestamp, unixTimestampToDynamicDisplay } = require("../../../utilities/formatting-utilities.js");
const { EMBED_COLOURS } = require("../../../constants/discord-constants.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("undone")
		.setDescription("In a game channel, prints a list nations whose turns' are undone or unfinished.")
        .setDMPermission(false),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);
    await commandPermissions.assertGameHasStarted(commandContext);

    const gameObject = commandContext.targetedGame;
    const status = gameObject.getLastKnownStatus();
    const latestTimestamp = _getLatestUpdateTimestamp(status);

    if (status == null)
        return commandContext.respondToCommand(new MessagePayload(`Game status is currently unavailable`));

    if (assert.isInteger(+latestTimestamp) === false)
        return commandContext.respondToCommand(new MessagePayload(`Could not verify the last update time of undone turns`));

    return commandContext.respondToCommand(
        new MessagePayload()
            .addEmbeds(
                _buildEmbeds(status, latestTimestamp)
            )
    );
}

function _buildEmbeds(status, latestTimestamp) {
    const embeds = [];
    const turnNumber = status.getTurnNumber();
    const timeLeft = status.getTimeLeft();
    const dateWhenTurnWillRoll = timeLeft.toDateObject();
    const unixTimestamp = dateToUnixTimestamp(dateWhenTurnWillRoll);
    const unfinishedTurns = status.getUnfinishedTurns();
    const uncheckedTurns = status.getUncheckedTurns();
    
    embeds.push(
        new EmbedBuilder()
            .setColor(EMBED_COLOURS.INFO)
            .setTitle(`__Turn ${turnNumber} Status__`)
            .setDescription(`Next Turn:\n\n${unixTimestampToDynamicDisplay(unixTimestamp)},\nin ${timeLeft.printTimeLeft()}.`)
            .setFooter({ text: "Last checked" })
            .setTimestamp(latestTimestamp)
    );

    if (assert.isArray(unfinishedTurns) === true && unfinishedTurns.length > 0) {
        embeds.push(
            new EmbedBuilder()
                .setColor(EMBED_COLOURS.WARNING)
                .setTitle("Unfinished Turns")
                .setDescription(unfinishedTurns.join("\n"))
        );
    }

    if (assert.isArray(uncheckedTurns) === true && uncheckedTurns.length > 0) {
        embeds.push(
            new EmbedBuilder()
                .setColor(EMBED_COLOURS.ERROR)
                .setTitle("Unchecked Turns")
                .setDescription(uncheckedTurns.join("\n"))
        );
    }

    return embeds;
}

function _getLatestUpdateTimestamp(lastKnownStatus)
{
    if (lastKnownStatus == null)
        return null;

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
