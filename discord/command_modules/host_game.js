
const log = require("../../logger.js");
const asserter = require("../../asserter.js");
const config = require("../../config/config.json");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const gameFactory = require("../../games/game_factory.js");
const MessagePayload = require("../prototypes/message_payload.js");

const activeMenuStore = require("../../menus/active_menu_store.js");
const hostServerStore = require("../../servers/host_server_store.js");
const { SemanticError } = require("../../errors/custom_errors.js");


const commandData = new CommandData("HOST_GAME");


module.exports = HostGameCommand;

function HostGameCommand()
{
    const hostGameCommand = new Command(commandData);

    hostGameCommand.addBehaviour(_behaviour);

    hostGameCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        _isThereHostingSpaceAvailableOrThrow
    );

    return hostGameCommand;
}

function _behaviour(commandContext)
{
    const guildWrapper = commandContext.getGuildWrapper();
    const guildMemberWrapper = commandContext.getSenderGuildMemberWrapper();
    const commandArguments = commandContext.getCommandArgumentsArray();
    const selectedServerName = commandArguments[0];
    const gameType = commandArguments[1];
    const useDefaultsArgument = commandArguments[2];
    const selectedServer = hostServerStore.getHostServerByName(selectedServerName);

    if (selectedServer == null || selectedServer.isOnline() === false)
        return commandContext.respondToCommand(new MessagePayload(`You must specify a server name from the ones available below:\n\n${hostServerStore.printListOfOnlineHostServers().toBox()}`));

    if (asserter.isValidGameType(gameType) === false)
        return commandContext.respondToCommand(new MessagePayload(`You must specify the type of game you wish to host. Either ${config.dom5GameTypeName} or ${config.dom6GameTypeName}`));


    return selectedServer.reserveGameSlot()
    .then((reservedPort) =>
    {
        const newGameObject = gameFactory.createDominionsGame(reservedPort, selectedServer, guildWrapper, guildMemberWrapper, gameType);

        if (useDefaultsArgument != null && useDefaultsArgument === "default")
        {
            log.general(log.getVerboseLevel(), "Hosting game using default values.");
            return activeMenuStore.startHostGameMenu(newGameObject, true);
        }
        
        return commandContext.respondToCommand(new MessagePayload(`A DM was sent to you to host the game.`))
        .then(() => activeMenuStore.startHostGameMenu(newGameObject));
    });
}

function _isThereHostingSpaceAvailableOrThrow()
{
    var isThereSpace = hostServerStore.isThereHostingSpaceAvailable();

    if (isThereSpace === false)
        throw new SemanticError(`There are currently no available slots in any online server to host a game.`);
}