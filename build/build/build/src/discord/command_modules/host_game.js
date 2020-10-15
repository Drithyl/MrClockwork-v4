"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var gameFactory = require("../../games/game_factory.js");
var activeMenuStore = require("../../menus/active_menu_store.js");
var hostServerStore = require("../../servers/host_server_store.js");
var SemanticError = require("../../errors/custom_errors.js").SemanticError;
var commandData = new CommandData("HOST_DOM5_GAME");
module.exports = HostDom5GameCommand;
function HostDom5GameCommand() {
    var hostDom5GameCommand = new Command(commandData);
    hostDom5GameCommand.addBehaviour(_behaviour);
    hostDom5GameCommand.addRequirements(commandPermissions.assertMemberIsTrusted, _isThereHostingSpaceAvailableOrThrow);
    return hostDom5GameCommand;
}
function _behaviour(commandContext) {
    var guildWrapper = commandContext.getGuildWrapper();
    var guildMemberWrapper = commandContext.getSenderGuildMemberWrapper();
    var commandArguments = commandContext.getCommandArgumentsArray();
    var selectedServerName = commandArguments[0];
    var useDefaultsArgument = commandArguments[1];
    var selectedServer = hostServerStore.getHostServerByName(selectedServerName);
    if (selectedServer == null || selectedServer.isOnline() === false)
        throw new SemanticError("You must specify a server name from the ones available below:\n\n" + hostServerStore.getListOfOnlineHostServers().toBox());
    return selectedServer.reserveGameSlot()
        .then(function (reservedPort) {
        var newGameObject = gameFactory.createDominions5Game(reservedPort, selectedServer, guildWrapper, guildMemberWrapper);
        if (useDefaultsArgument != null && useDefaultsArgument === "default") {
            console.log("Using default values.");
            return activeMenuStore.startHostGameMenu(newGameObject, true);
        }
        else
            return activeMenuStore.startHostGameMenu(newGameObject);
    });
}
function _isThereHostingSpaceAvailableOrThrow() {
    var isThereSpace = hostServerStore.isThereHostingSpaceAvailable();
    if (isThereSpace === false)
        throw new SemanticError("There are currently no available slots in any online server to host a game.");
}
//# sourceMappingURL=host_game.js.map