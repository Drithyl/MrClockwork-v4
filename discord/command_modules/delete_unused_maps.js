const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const hostServerStore = require("../../servers/host_server_store.js");
const ongoingGamesStore = require("../../games/ongoing_games_store.js");
const MessagePayload = require("../prototypes/message_payload.js");

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
    const isForcingDeletion = /^force$/i.test(commandArguments[1]);
    var targetedServer;

    if (targetedServerName == null)
        return commandContext.respondToCommand(new MessagePayload(`You must specify a server name from the ones available below:\n\n${hostServerStore.printListOfOnlineHostServers().toBox()}`));

    if (hostServerStore.hasHostServerByName(targetedServerName) === false)
        return commandContext.respondToCommand(new MessagePayload(`Selected server does not exist.`));


    targetedServer = hostServerStore.getHostServerByName(targetedServerName);


    if (targetedServer.isOnline() === false)
        return commandContext.respondToCommand(new MessagePayload(`Selected server is offline.`));


    games.forEach((game) =>
    {
        const settingsObject = game.getSettingsObject();
        const mapSetting = settingsObject.getMapSetting();

        if (game.getServerId() === targetedServer.getId() === true)
            usedMaps.push(mapSetting.getValue());
    });

    return targetedServer.emitPromise("DELETE_UNUSED_MAPS", { mapsInUse: usedMaps, force: isForcingDeletion })
    .then((deletedMaps) => 
    {
        const payload = new MessagePayload(`A total of ${deletedMaps.length} map-related files were deleted.`);
        payload.setAttachment("deleted_maps.txt", Buffer.from(deletedMaps.join("\n"), "utf8"));
        return commandContext.respondToCommand(payload);
    })
    .catch((err) => commandContext.respondToCommand(new MessagePayload(`Error occurred: ${err.message}\n\n${err.stack}`)));
}