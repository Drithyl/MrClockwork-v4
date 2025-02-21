const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("launch")
		.setDescription("In a game channel, launches a game's process. Use if the bot mentions the **game** being offline.")
        .setDMPermission(false),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);
    await commandPermissions.assertServerIsOnline(commandContext);
    await commandPermissions.assertMemberIsTrusted(commandContext);

    const targetedGame = commandContext.targetedGame;

    await commandContext.respondToCommand(new MessagePayload(`Launching process...`));
    await targetedGame.launch();
    return commandContext.respondToCommand(new MessagePayload(`The process has been launched. It might take a couple of minutes to load the game.`));
}
