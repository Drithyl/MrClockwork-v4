
const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const MessagePayload = require("../../prototypes/message_payload.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("force_host")
		.setDescription("[Game-organizer-only] In a game channel, forces a turn to roll immediately.")
        .setDMPermission(false),

	execute: behaviour
};

async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);
    await commandPermissions.assertMemberIsOrganizer(commandContext);
    await commandPermissions.assertServerIsOnline(commandContext);
    await commandPermissions.assertGameIsOnline(commandContext);
    await commandPermissions.assertGameHasStarted(commandContext);

    const gameObject = commandContext.targetedGame;

    await gameObject.forceHost();
    await commandContext.respondToCommand(new MessagePayload(
        `The turn will start processing in a few seconds.`
    ));
}
