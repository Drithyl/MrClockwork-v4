
const fsp = require("fs").promises;
const log = require("../logger.js");
const config = require("../config/config.json");
const guildStore = require("../discord/guild_store.js");
const DominionsGame = require("./prototypes/dominions_game.js");

exports.loadGame = (pathToJSONDataFile) =>
{
    let loadedGame;
    let parsedData;
    let gameType;

    return fsp.readFile(pathToJSONDataFile)
    .then((jsonStringData) => 
    {
        parsedData = JSON.parse(jsonStringData);
        gameType = (parsedData.type == null) ? config.dom5GameTypeName : parsedData.type;
        
        log.general(log.getLeanLevel(), `Parsed JSON data`, parsedData);

        if (guildStore.hasGuildWrapper(parsedData.guildId) === false)
            return Promise.reject(new Error(`Bot is not deployed on ${parsedData.name}'s guild; skipping loading.`));


        log.general(log.getLeanLevel(), `${parsedData.name}: Creating game object...`);
        loadedGame = new DominionsGame(gameType);
        log.general(log.getLeanLevel(), `${parsedData.name}: Loading JSON data...`);
        return loadedGame.loadJSONData(parsedData);
    })
    .then(() =>
    {
        log.general(log.getNormalLevel(), `Game data loaded, returning!`);
        return Promise.resolve(loadedGame);
    });
};

exports.createDominionsGame = (reservedPort, hostServer, guildWrapper, organizerWrapper, gameType) =>
{
    var newGameObject = new DominionsGame(gameType);
    newGameObject.setPort(reservedPort);
    newGameObject.setServer(hostServer);
    newGameObject.setGuild(guildWrapper);
    newGameObject.setOrganizer(organizerWrapper);
    return newGameObject;
};