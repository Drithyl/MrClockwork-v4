"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var hostServerStore = require("../../servers/host_server_store.js");
var SemanticError = require("../../errors/custom_errors.js").SemanticError;
var commandData = new CommandData("GET_DOM5_MAPS_ON_SERVER");
module.exports = GetDom5MapsOnServerCommand;
function GetDom5MapsOnServerCommand() {
    var getDom5MapsOnServerCommand = new Command(commandData);
    getDom5MapsOnServerCommand.addBehaviour(_behaviour);
    return getDom5MapsOnServerCommand;
}
function _behaviour(commandContext) {
    var commandArguments = commandContext.getCommandArgumentsArray();
    var targetedServerName = commandArguments[0];
    var targetedServerObject;
    if (targetedServerName == null)
        throw new SemanticError("You must specify a server name from the ones available below:\n\n" + hostServerStore.getListOfOnlineHostServers().toBox());
    if (hostServerStore.hasHostServerByName(targetedServerName) === false)
        return commandContext.respondToCommand("Selected server does not exist.");
    targetedServerObject = hostServerStore.getHostServerByName(targetedServerName);
    if (targetedServerObject.isOnline() === false)
        return commandContext.respondToCommand("Selected server is offline.");
    return getListOfMapsOnServerAndSend(targetedServerObject, commandContext);
}
function getListOfMapsOnServerAndSend(serverObject, commandContext) {
    var introductionString = "Below is the list of maps available:\n\n";
    var stringList = "";
    return serverObject.emitPromise("GET_MAP_LIST")
        .then(function (list) {
        if (list.length <= 0)
            return commandContext.respondToCommand("No maps are available on this server.");
        list.forEach(function (map) { return stringList += (map.name).width(48) + " (" + map.land.toString().width(4) + " land, " + map.sea.toString().width(3) + " sea).\n"; });
        return commandContext.respondToCommand(introductionString + stringList.toBox());
    });
}
//# sourceMappingURL=get_dom5_maps_on_server.js.map