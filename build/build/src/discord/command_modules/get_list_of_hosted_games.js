"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var ongoingGamesStore = require("../../games/ongoing_games_store.js");
var commandData = new CommandData("GET_LIST_OF_HOSTED_GAMES");
module.exports = GetListOfHostedGamesCommand;
function GetListOfHostedGamesCommand() {
    var getListOfHostedGamesCommand = new Command(commandData);
    getListOfHostedGamesCommand.addBehaviour(_behaviour);
    return getListOfHostedGamesCommand;
}
function _behaviour(commandContext) {
    var arrayOfOngoingGames = ongoingGamesStore.getArrayOfGames();
    var stringIntroduction = "Find the list of games below:\n\n";
    var stringListOfGames = "";
    return arrayOfOngoingGames.forEachPromise(function (gameObject, index, nextPromise) {
        var name = gameObject.getName();
        var ip = gameObject.getIp();
        var port = gameObject.getPort();
        var hostServer = gameObject.getServer();
        stringListOfGames += name.width(33) + " " + (ip + ":" + port.toString()).width(22);
        if (hostServer == null) {
            stringListOfGames += "Server Dead".width(28) + " Offline";
            return nextPromise();
        }
        else if (hostServer.isOnline() === false) {
            stringListOfGames += ("Server Offline (" + hostServer.getName() + ")").width(28) + " Offline";
            return nextPromise();
        }
        else {
            return gameObject.isOnlineCheck()
                .then(function (isOnline) {
                var onlineStr = (isOnline === true) ? "Online" : "Offline";
                stringListOfGames += hostServer.getName().width(28) + " " + onlineStr;
                nextPromise();
            });
        }
    })
        .then(function () {
        return commandContext.respondToCommand(stringIntroduction + stringListOfGames.toBox());
    });
}
//# sourceMappingURL=get_list_of_hosted_games.js.map