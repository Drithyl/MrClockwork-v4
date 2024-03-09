const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("pause")
		.setDescription("In a game channel, pauses or unpauses a game."),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);
    await commandPermissions.assertGameHasStarted(commandContext);
    await commandPermissions.assertMemberIsOrganizer(commandContext);

    const gameObject = commandContext.targetedGame;
    const lastKnownStatus = gameObject.getLastKnownStatus();
    const lastKnownTurnNumber = lastKnownStatus.getTurnNumber();

    if (lastKnownTurnNumber <= 0)
        return commandContext.respondToCommand(new MessagePayload(`Game is being setup in lobby.`));
    
    lastKnownStatus.setIsPaused(!lastKnownStatus.isPaused());

    if (lastKnownStatus.isPaused() === true)
        return commandContext.respondToCommand(new MessagePayload(`Game is now paused.`));

    else return commandContext.respondToCommand(new MessagePayload(`Game is now no longer paused, and there are ${lastKnownStatus.printTimeLeft()} left till next turn.`));
}
