
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const gamesStore = require("../../games/ongoing_games_store.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("RESET_PORT");

module.exports = ResetPortCommand;

function ResetPortCommand()
{
    const resetPortCommand = new Command(commandData);

    resetPortCommand.addBehaviour(_behaviour);

    resetPortCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertServerIsOnline,
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertMemberIsOrganizer
    );

    return resetPortCommand;
}

async function _behaviour(commandContext)
{
    const targetedGame = commandContext.getGameTargetedByCommand();
    const hostServer = targetedGame.getServer();
    const currentPort = targetedGame.getPort();

    if (hostServer.hasAvailableSlots() === false)
        return commandContext.respondToCommand(new MessagePayload(`No other ports are available to use. Port will remain the same (${currentPort})`));

    const newPort = await targetedGame.emitPromiseWithGameDataToServer("RESET_PORT");
    targetedGame.setPort(newPort);
    return targetedGame.sendGameAnnouncement(`New port ${newPort} has been set. You will have to kill/launch the game manually for it to update.`);
}