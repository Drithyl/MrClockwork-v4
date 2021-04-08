
const log = require("../../logger.js");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("DELETE_GAME");

module.exports = DeleteGameCommand;

function DeleteGameCommand()
{
    const deleteGameCommand = new Command(commandData);

    deleteGameCommand.addBehaviour(_behaviour);

    deleteGameCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertMemberIsOrganizer
    );

    return deleteGameCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    
    return commandContext.respondToCommand(`Deleting game...`)
    .then(() => gameObject.deleteGame())
    .then(() => gameObject.deleteRole())
    .then(() => 
    {
        log.general(log.getLeanLevel(), `${gameObject.getName()} and its role were deleted successfully.`);
        commandContext.respondToCommand(`The game has been deleted.`)
    });
}