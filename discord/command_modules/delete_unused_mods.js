
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const { SemanticError } = require("../../errors/custom_errors.js");
const hostServerStore = require("../../servers/host_server_store.js");
const ongoingGamesStore = require("../../games/ongoing_games_store.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("DELETE_UNUSED_MODS");

module.exports = DeleteUnusedModsCommand;

function DeleteUnusedModsCommand()
{
    const deleteUnusedModsCommand = new Command(commandData);

    deleteUnusedModsCommand.addBehaviour(_behaviour);

    deleteUnusedModsCommand.addSilentRequirements(
        commandPermissions.assertMemberIsDev
    );

    return deleteUnusedModsCommand;
}

function _behaviour(commandContext)
{
    var usedMods = [];
    const games = ongoingGamesStore.getArrayOfGames();
    const commandArguments = commandContext.getCommandArgumentsArray();
    const targetedServerName = commandArguments[0];
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
        const modsSetting = settingsObject.getModsSetting();

        if (game.getServerId() === targetedServer.getId() === true)
            usedMods = usedMods.concat(modsSetting.getValue());
    });

    return targetedServer.emitPromise("DELETE_UNUSED_MODS", usedMods)
    .then((deletedMods) => 
    {
        const deletedModsStringList = deletedMods.join("\n").toBox();
        const payload = new MessagePayload(`The following mod files were deleted:`);
        payload.setAttachment("deleted_mods.txt", Buffer.from(deletedModsStringList, "utf8"));

        return commandContext.respondToCommand(payload);
    });
}