"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var hostServerStore = require("../../servers/host_server_store.js");
var SemanticError = require("../../errors/custom_errors.js").SemanticError;
var commandData = new CommandData("GET_DOM5_MODS_ON_SERVER");
module.exports = GetDom5ModsOnServerCommand;
function GetDom5ModsOnServerCommand() {
    var getDom5ModsOnServerCommand = new Command(commandData);
    getDom5ModsOnServerCommand.addBehaviour(_behaviour);
    return getDom5ModsOnServerCommand;
}
function _behaviour(commandContext) {
    var commandArguments = commandContext.getCommandArgumentsArray();
    var targetedServerName = commandArguments[0];
    var targetedServerObject;
    if (targetedServerName == null)
        throw new SemanticError("You must specify a server name from the ones available below:\n\n" + hostServerStore.getListOfOnlineHostServers().toBox());
    if (hostServerStore.hasHostServerByName(targetedServerName) === false)
        return commandContext.respondToCommand("Selected server is does not exist.");
    targetedServerObject = hostServerStore.getHostServerByName(targetedServerName);
    if (targetedServerObject.isOnline() === false)
        return commandContext.respondToCommand("Selected server is offline.");
    return getListOfModsOnServerAndSend(targetedServerObject, commandContext);
}
function getListOfModsOnServerAndSend(serverObject, commandContext) {
    var introductionString = "Below is the list of maps available:\n\n";
    var stringList = "";
    return serverObject.emitPromise("GET_MOD_LIST")
        .then(function (list) {
        if (list.length <= 0)
            return commandContext.respondToCommand("No mods are available on this server.");
        list.forEach(function (modFilename) { return stringList += modFilename + "\n"; });
        return commandContext.respondToCommand(introductionString + stringList.toBox());
    });
}
//# sourceMappingURL=get_dom5_mods_on_server.js.map