const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");
const gamesStore = require("../../../games/ongoing_games_store.js");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("reset_port")
		.setDescription("[Organizer-only] Assigns a new port to the game (or the same one if it's found to be free).")
        .setDMPermission(false),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);
    await commandPermissions.assertServerIsOnline(commandContext);
    await commandPermissions.assertMemberIsTrusted(commandContext);
    await commandPermissions.assertMemberIsOrganizer(commandContext);

    const targetedGame = commandContext.targetedGame;
    const hostServer = targetedGame.getServer();
    const ongoingGames = gamesStore.getOngoingGamesOnServer(hostServer);
    const currentPort = targetedGame.getPort();
    const gameWithSamePort = ongoingGames.find((game) => game.getPort() === currentPort);

    if (gameWithSamePort == null || gameWithSamePort.getName() === targetedGame.getName())
        return commandContext.respondToCommand(new MessagePayload(`Current port ${currentPort} is free; no need to reset it.`));

    const newPort = await targetedGame.emitPromiseWithGameDataToServer("RESET_PORT");
    targetedGame.setPort(newPort);

    return targetedGame.sendGameAnnouncement(
        `New port ${newPort} has been set. You will have to kill/launch the game manually for it to update.`
    );
}