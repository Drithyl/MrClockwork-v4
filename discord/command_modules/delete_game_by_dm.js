
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

async function _behaviour(commandContext)
{
    const commandArgumentsArray = commandContext.getCommandArgumentsArray();
    const nameOfGameToRepair = commandArgumentsArray[0];
    const gameObject = ongoingGamesStore.getOngoingGameByName(nameOfGameToRepair);

    
    await commandContext.respondToCommand(new MessagePayload(`Deleting game...`));

    if (gameObject == null)
        await gameObject.emitPromiseWithGameDataToServer("DELETE_GAME", null, 130000);

    else await gameObject.deleteGame();

    await gameObject.deleteRole();
    await gameObject.deleteChannel();
    await commandContext.respondToCommand(new MessagePayload(`The game was successfully deleted.`));
    log.general(log.getLeanLevel(), `${gameObject.getName()} and its role and channel were deleted successfully.`);
}