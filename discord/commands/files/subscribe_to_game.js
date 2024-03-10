const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("subscribe")
		.setDescription("Assigns yourself the role of the game. Claiming a pretender assigns it automatically.")
        .setDMPermission(false),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);

    const gameObject = commandContext.targetedGame;
    const gameRole = gameObject.getRole();
    const guildMemberWrapper = commandContext.memberWrapper;

    if (gameRole == null)
        return commandContext.respondToCommand(new MessagePayload(`This game's role does not exist; cannot assign it.`));

    await guildMemberWrapper.addRole(gameRole);
    return commandContext.respondToCommand(new MessagePayload(`The game's role has been assigned to you.`));
}