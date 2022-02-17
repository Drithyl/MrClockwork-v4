
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("RESTART_GAME");

module.exports = RestartGameCommand;

function RestartGameCommand()
{
    const restartGameCommand = new Command(commandData);

    restartGameCommand.addBehaviour(_behaviour);

    restartGameCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertServerIsOnline,
        commandPermissions.assertGameIsOnline,
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertMemberIsOrganizer
    );

    return restartGameCommand;
}

async function _behaviour(commandContext)
{
    const targetedGame = commandContext.getGameTargetedByCommand();
    const status = targetedGame.getLastKnownStatus();
    const commandArguments = commandContext.getCommandArgumentsArray();
    const deletePretenders = (/^true$/i.test(commandArguments[0]) === true) ? true : false;

    await commandContext.respondToCommand(new MessagePayload(`Restarting game...`));
    await targetedGame.emitPromiseWithGameDataToServer("RESTART_GAME", { deletePretenders }, 130000);

    if (deletePretenders === true)
        await targetedGame.removeNationClaims();

    status.setHasStarted(false);
    status.setMsToDefaultTimer(targetedGame);
    return commandContext.respondToCommand(new MessagePayload(`The game has been restarted. It may take a minute or two to update properly.`));
}