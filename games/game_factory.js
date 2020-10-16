
const fs = require("fs");
const Dominions5Game = require("./prototypes/dominions5_game.js");

exports.loadGame = (pathToJSONDataFile) =>
{
    var loadedGame = new Dominions5Game();

    var jsonStringData = fs.readFileSync(pathToJSONDataFile);
    var jsonParsedData = JSON.parse(jsonStringData);

    loadedGame.loadJSONData(jsonParsedData);
    console.log("Data loaded, returning!");
    return loadedGame;
};

exports.createDominions5Game = (reservedPort, hostServer, guildWrapper, organizerWrapper) =>
{
    var newGameObject = new Dominions5Game();
    newGameObject.setPort(reservedPort);
    newGameObject.setServer(hostServer);
    newGameObject.setGuild(guildWrapper);
    newGameObject.setOrganizer(organizerWrapper);
    return newGameObject;
};