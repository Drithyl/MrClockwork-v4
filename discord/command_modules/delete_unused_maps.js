
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const { SemanticError } = require("../../errors/custom_errors.js");
const hostServerStore = require("../../servers/host_server_store.js");
const ongoingGamesStore = require("../../games/ongoing_games_store.js");

const commandData = new CommandData("DELETE_UNUSED_MAPS");

module.exports = DeleteUnusedMapsCommand;

function DeleteUnusedMapsCommand()
{
    const deleteUnusedMapsCommand = new Command(commandData);

    deleteUnusedMapsCommand.addBehaviour(_behaviour);

    deleteUnusedMapsCommand.addSilentRequirements(
        commandPermissions.assertMemberIsDev
    );

    return deleteUnusedMapsCommand;
}

function _behaviour(commandContext)
{
    const usedMaps = [];
    const games = ongoingGamesStore.getArrayOfGames();
    const commandArguments = commandContext.getCommandArgumentsArray();
    const targetedServerName = commandArguments[0];
    var targetedServer;


    if (targetedServerName == null)
        throw new SemanticError(`You must specify a server name from the ones available below:\n\n${hostServerStore.printListOfOnlineHostServers().toBox()}`);

    if (hostServerStore.hasHostServerByName(targetedServerName) === false)
        return commandContext.respondToCommand(`Selected server does not exist.`);


    targetedServer = hostServerStore.getHostServerByName(targetedServerName);


    if (targetedServer.isOnline() === false)
        return commandContext.respondToCommand(`Selected server is offline.`);


    games.forEach((game) =>
    {
        const settingsObject = game.getSettingsObject();
        const mapSetting = settingsObject.getMapSetting();

        if (game.getServerId() === targetedServer.getId() === true)
            usedMaps.push(mapSetting.getValue());
    });

    return targetedServer.emitPromise("DELETE_UNUSED_MAPS", usedMaps)
    .then((deletedMaps) => 
    {
        const deletedMapsStringList = deletedMaps.join("\n").toBox();
        commandContext.respondToCommand(`The following maps were deleted:\n\n${deletedMapsStringList}`);
    })
    .catch((err) => commandContext.respondToCommand(`Error occurred: ${err.message}\n\n${err.stack}`));
}