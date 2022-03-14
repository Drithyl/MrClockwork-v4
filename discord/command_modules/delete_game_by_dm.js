
const log = require("../../logger.js");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const hostServerStore = require("../../servers/host_server_store.js");
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
    const nameOfGameToDelete = commandArgumentsArray[0];
    const gameObject = ongoingGamesStore.getOngoingGameByName(nameOfGameToDelete);

    
    await commandContext.respondToCommand(new MessagePayload(`Deleting game...`));

    if (gameObject == null)
    {
        const servers = hostServerStore.getOnlineServers();
        const promises = servers.map((server) => server.emitPromise("DELETE_GAME", { 
            name: nameOfGameToDelete 
        }, 130000));

        await Promise.allSettled(promises);
        await commandContext.respondToCommand(new MessagePayload(`${nameOfGameToDelete} does not exist on master; sent message to online slaves to delete leftover files.`));
        log.general(log.getLeanLevel(), `${nameOfGameToDelete} does not exist on master; sent message to online slaves to delete leftover files.`);
    }

    else
    {
        await gameObject.deleteGame();
        await gameObject.deleteRole();
        await gameObject.deleteChannel();
        await commandContext.respondToCommand(new MessagePayload(`The game was successfully deleted.`));
        log.general(log.getLeanLevel(), `${nameOfGameToDelete} and its role and channel were deleted successfully.`);
    }
}