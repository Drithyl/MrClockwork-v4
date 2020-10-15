
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const gameFactory = require("../../games/game_factory.js");

const activeMenuStore = require("../../menus/active_menu_store.js");
const hostServerStore = require("../../servers/host_server_store.js");
const { SemanticError } = require("../../errors/custom_errors.js");


const commandData = new CommandData("HOST_DOM5_GAME");


module.exports = HostDom5GameCommand;

function HostDom5GameCommand()
{
    const hostDom5GameCommand = new Command(commandData);

    hostDom5GameCommand.addBehaviour(_behaviour);

    hostDom5GameCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        _isThereHostingSpaceAvailableOrThrow
    );

    return hostDom5GameCommand;
}

function _behaviour(commandContext)
{
    const guildWrapper = commandContext.getGuildWrapper();
    const guildMemberWrapper = commandContext.getSenderGuildMemberWrapper();

    const commandArguments = commandContext.getCommandArgumentsArray();
    const selectedServerName = commandArguments[0];
    const useDefaultsArgument = commandArguments[1];

    const selectedServer = hostServerStore.getHostServerByName(selectedServerName);

    if (selectedServer == null || selectedServer.isOnline() === false)
        throw new SemanticError(`You must specify a server name from the ones available below:\n\n${hostServerStore.getListOfOnlineHostServers().toBox()}`);

    return selectedServer.reserveGameSlot()
    .then((reservedPort) =>
    {
        var newGameObject = gameFactory.createDominions5Game(reservedPort, selectedServer, guildWrapper, guildMemberWrapper);

        if (useDefaultsArgument != null && useDefaultsArgument === "default")
        {
            console.log("Using default values.");
            return activeMenuStore.startHostGameMenu(newGameObject, true);
        }
        
        else return activeMenuStore.startHostGameMenu(newGameObject);
    });
}

function _isThereHostingSpaceAvailableOrThrow()
{
    var isThereSpace = hostServerStore.isThereHostingSpaceAvailable();

    if (isThereSpace === false)
        throw new SemanticError(`There are currently no available slots in any online server to host a game.`);
}