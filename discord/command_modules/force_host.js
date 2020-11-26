
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("FORCE_HOST");

module.exports = ForceHostCommand;

function ForceHostCommand()
{
    const forceHostCommand = new Command(commandData);

    forceHostCommand.addBehaviour(_behaviour);

    forceHostCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertMemberIsOrganizer,
        commandPermissions.assertServerIsOnline,
        commandPermissions.assertGameIsOnline,
        commandPermissions.assertGameHasStarted
    );

    return forceHostCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();

    return gameObject.emitPromiseWithGameDataToServer("FORCE_HOST")
    .then(() => commandContext.respondToCommand(`The turn will start processing in a few seconds.`));
}