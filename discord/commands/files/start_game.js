const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("start_game")
		.setDescription("[Game-organizer-only] Starts the game. Can take long depending on size (even > 20 minutes).")
        .setDMPermission(false),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);
    await commandPermissions.assertServerIsOnline(commandContext);
    await commandPermissions.assertGameIsOnline(commandContext);
    await commandPermissions.assertGameHasNotStarted(commandContext);
    await commandPermissions.assertMemberIsTrusted(commandContext);
    await commandPermissions.assertMemberIsOrganizer(commandContext);

    const targetedGame = commandContext.targetedGame;

    await targetedGame.start();
    return commandContext.respondToCommand(new MessagePayload(
        `The game will start the setup process in a minute. Depending on the map and players, it may take a significant amount of time.`
    ));
}