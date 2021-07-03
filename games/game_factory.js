
const fsp = require("fs").promises;
const log = require("../logger.js");
const Dominions5Game = require("./prototypes/dominions5_game.js");

exports.loadGame = (pathToJSONDataFile) =>
{
    var loadedGame = new Dominions5Game();

    return fsp.readFile(pathToJSONDataFile)
    .then((jsonStringData) => 
    {
        var jsonParsedData = JSON.parse(jsonStringData);
        loadedGame.loadJSONData(jsonParsedData);
        log.general(log.getNormalLevel(), `Game data loaded, returning!`);
        return loadedGame;
    });
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