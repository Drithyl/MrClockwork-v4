
const log = require("../../logger.js");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const ongoingGamesStore = require("../../games/ongoing_games_store.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("DELETE_GAME_BY_DM");

module.exports = DeleteGameByDmCommand;

function DeleteGameByDmCommand()
{
    const deleteGameByDmCommand = new Command(commandData);

    deleteGameByDmCommand.addBehaviour(_behaviour);

    deleteGameByDmCommand.addRequirements(
        commandPermissions.assertMemberIsDev
    );

    return deleteGameByDmCommand;
}

function _behaviour(commandContext)
{
    const commandArgumentsArray = commandContext.getCommandArgumentsArray();
    const nameOfGameToRepair = commandArgumentsArray[0];
    var gameObject;
    

    if (ongoingGamesStore.hasOngoingGameByName(nameOfGameToRepair) === false)
        return commandContext.respondToCommand(new MessagePayload(`No game found with this name.`));

    gameObject = ongoingGamesStore.getOngoingGameByName(nameOfGameToRepair);

    
    return commandContext.respondToCommand(new MessagePayload(`Deleting game...`))
    .then(() => gameObject.deleteGame())
    .then(() => gameObject.deleteRole())
    .then(() => gameObject.deleteChannel())
    .then(() => commandContext.respondToCommand(new MessagePayload(`The game was successfully deleted.`)))
    .then(() => log.general(log.getLeanLevel(), `${gameObject.getName()} and its role and channel were deleted successfully.`));
}