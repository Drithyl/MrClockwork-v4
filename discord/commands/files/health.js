const os = require("os");
const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const ongoingGamesStore = require("../../../games/ongoing_games_store.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("health")
		.setDescription("Export CSV data on the health of ongoing games."),

	execute: behaviour,

    // This command will never be deployed globally; only to a private dev guild
    isDev: true
};

async function behaviour(commandContext)
{
    const ongoingGames = ongoingGamesStore.getArrayOfGames();
    let csv = "NAME, TURN_NUMBER, LAST_TURN, LAST_TURN_DATE, SERVER, GUILD, GUILD_ID, ORGANIZER, ORGANIZER_ID, CHANNEL, CHANNEL_ID, ROLE, ROLE_ID" + os.EOL;
    

    for (const game of ongoingGames) {
        const debugData = await game.debug();
        csv += `${debugData.name}, `;
        csv += `${debugData.status?.turnNumber},`;
        csv += `${debugData.status?.lastTurnTimestamp}, `;
        csv += `${new Date(debugData.status?.lastTurnTimestamp).toString()}, `;
        csv += `${debugData.server}, `;
        csv += `${debugData.guild}, `;
        csv += `${debugData.guildId}, `;
        csv += `${debugData.organizer}, `;
        csv += `${debugData.organizerId}, `;
        csv += `${debugData.channel}, `;
        csv += `${debugData.channelId}, `;
        csv += `${debugData.role}, `;
        csv += `${debugData.roleId}${os.EOL}`;
    }

    await commandContext.respondToCommand(
        new MessagePayload("Health report attached:")
            .setAttachment(
                "health.csv",
                Buffer.from(csv)
            )
    );
}
