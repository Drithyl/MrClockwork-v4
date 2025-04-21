const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");
const assert = require("../../../asserter.js");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("rollback_turn")
		.setDescription("[Game-organizer-only] Rollbacks to the previous turn. Only keeps backups of a few turns back.")
        .setDMPermission(false),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);
    await commandPermissions.assertServerIsOnline(commandContext);
    await commandPermissions.assertMemberIsTrusted(commandContext);
    await commandPermissions.assertMemberIsOrganizer(commandContext);

    const ROLLBACK_REQUEST_TIMEOUT = 150000;
    const targetedGame = commandContext.targetedGame;
    const status = targetedGame.getLastKnownStatus();
    const rollbackTurnNbr = status.getTurnNumber() - 1;

    if (assert.isInteger(rollbackTurnNbr) === false || rollbackTurnNbr <= 0)
        return commandContext.respondToCommand(new MessagePayload(`Cannot rollback; turn number '${rollbackTurnNbr}' is incorrect.`));

    await commandContext.respondToCommand(new MessagePayload(`Attempting to roll turn back to turn ${rollbackTurnNbr}...`));
    await targetedGame.emitPromiseWithGameDataToServer("ROLLBACK", { turnNbr: rollbackTurnNbr }, ROLLBACK_REQUEST_TIMEOUT);

    return commandContext.respondToCommand(new MessagePayload(`The turn has been rolled back. It may take a minute or two to update properly.`));
}
