
const fsp = require("fs").promises;
const log = require("../logger.js");
const guildStore = require("../discord/guild_store.js");
const Dominions5Game = require("./prototypes/dominions5_game.js");

exports.loadGame = (pathToJSONDataFile) =>
{
    var loadedGame;
    var parsedData;

    return fsp.readFile(pathToJSONDataFile)
    .then((jsonStringData) => 
    {
        parsedData = JSON.parse(jsonStringData);

        if (guildStore.hasGuildWrapper(parsedData.guildId) === false)
            return Promise.reject(new Error(`Bot is not deployed on ${parsedData.name}'s guild; skipping loading.`));


        loadedGame = new Dominions5Game();
        return loadedGame.loadJSONData(parsedData);
    })
    .then(() =>
    {
        log.general(log.getNormalLevel(), `Game data loaded, returning!`);
        return Promise.resolve(loadedGame);
    })
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