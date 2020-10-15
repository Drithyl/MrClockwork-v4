"use strict";
var fs = require("fs");
var Dominions5Game = require("./prototypes/dominions5_game.js");
exports.loadGame = function (pathToJSONDataFile) {
    var loadedGame = new Dominions5Game();
    var jsonStringData = fs.readFileSync(pathToJSONDataFile);
    var jsonParsedData = JSON.parse(jsonStringData);
    loadedGame.loadJSONData(jsonParsedData);
    console.log("Data loaded, returning!");
    return loadedGame;
};
exports.createDominions5Game = function (reservedPort, hostServer, guildWrapper, organizerWrapper) {
    var newGameObject = new Dominions5Game();
    newGameObject.setPort(reservedPort);
    newGameObject.setServer(hostServer);
    newGameObject.setGuild(guildWrapper);
    newGameObject.setOrganizer(organizerWrapper);
    return newGameObject;
};
//# sourceMappingURL=game_factory.js.map