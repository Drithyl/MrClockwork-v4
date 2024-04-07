const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");


const DELETE_PRETENDERS_OPTION_NAME = "delete_pretenders";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("restart_game")
		.setDescription("[Game-organizer-only] Restarts the game back to the pretender lobby; players must resubmit.")
        .addBooleanOption(option =>
            option.setName(DELETE_PRETENDERS_OPTION_NAME)
            .setDescription("Should pretenders be deleted? If not, only pretenders of blank turns will be preserved.")
        )
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
    const status = targetedGame.getLastKnownStatus();
    const shouldDeletePretenders = commandContext.options.getBoolean(DELETE_PRETENDERS_OPTION_NAME);

    await commandContext.respondToCommand(new MessagePayload(`Restarting game...`));
    await targetedGame.emitPromiseWithGameDataToServer("RESTART_GAME", { shouldDeletePretenders }, 130000);

    if (shouldDeletePretenders === true)
        await targetedGame.removeNationClaims();

    status.setHasStarted(false);
    status.setMsToDefaultTimer(targetedGame);
    return commandContext.respondToCommand(new MessagePayload(
        `The game has been restarted. It may take a minute or two to update properly.`
    ));
}
