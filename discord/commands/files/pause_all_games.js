const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");
const gamesStore = require("../../../games/ongoing_games_store.js");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("pause_all")
		.setDescription("[Dev-only] Pauses all games."),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsDev(commandContext);

    const games = gamesStore.getArrayOfGames();
    
    games.forEach((game) =>
    {
        if (game.hasGameStarted() === true)
        {
            const lastKnownStatus = game.getLastKnownStatus();
            lastKnownStatus.setIsPaused(true);
        }
    });

    return commandContext.respondToCommand(new MessagePayload(`All started games have been paused.`));
}
