const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("unsubscribe")
		.setDescription("Removes the role of a game from yourself. Unclaiming/removing pretender already does this.")
        .setDMPermission(false),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);

    const gameObject = commandContext.targetedGame;
    const gameRole = gameObject.getRole();
    const guildMemberWrapper = commandContext.memberWrapper;

    await guildMemberWrapper.removeRole(gameRole);
    return commandContext.respondToCommand(new MessagePayload(
        `The game's role has been removed from you.`)
    );
}