
const assert = require("../../asserter.js");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("ROLLBACK_TURN");

module.exports = RollbackTurnCommand;

function RollbackTurnCommand()
{
    const rollbackTurnCommand = new Command(commandData);

    rollbackTurnCommand.addBehaviour(_behaviour);

    rollbackTurnCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertServerIsOnline,
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertMemberIsOrganizer
    );

    return rollbackTurnCommand;
}

function _behaviour(commandContext)
{
    const targetedGame = commandContext.getGameTargetedByCommand();
    const status = targetedGame.getLastKnownStatus();
    const rollbackTurnNbr = status.getTurnNumber() - 1;

    if (assert.isInteger(rollbackTurnNbr) === false || rollbackTurnNbr <= 0)
        return commandContext.respondToCommand(`Cannot rollback; turn number '${rollbackTurnNbr}' is incorrect.`);

    return targetedGame.emitPromiseWithGameDataToServer("ROLLBACK", { turnNbr: rollbackTurnNbr })
    .then(() => commandContext.respondToCommand(`The turn has been rolled back. It may take a minute or two to update properly.`))
    .catch((err) => commandContext.respondToCommand(`An error occurred:\n\n${err.message}`));
}