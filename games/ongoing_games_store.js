

const path = require("path");
const fsp = require("fs").promises;
const log = require("../logger.js");
const assert = require("../asserter.js");
const rw = require("../reader_writer.js");
const Game = require("./prototypes/game.js");
const config = require("../config/config.json");
const gameFactory = require("./game_factory.js");
const gameMonitor = require("./game_monitor.js");
const activeMenuStore = require("../menus/active_menu_store.js");

const _ongoingGamesByName = {};


exports.loadAll = async function()
{
    const pathToGameDataDir = path.resolve(config.dataPath, config.gameDataFolder);
    const gameDirNames = rw.getDirSubfolderNamesSync(pathToGameDataDir);
    const initializedGames = [];
    
    const promises = gameDirNames.map(async (gameDirName, i) =>
    {
        const gameJSONDataPath = path.resolve(pathToGameDataDir, gameDirName, "data.json");
        log.general(log.getLeanLevel(), `Loading ${gameDirName} (${i+1}/${gameDirNames.length})...`);
        
        try {
            const loadedGame = await gameFactory.loadGame(gameJSONDataPath);
            log.general(log.getLeanLevel(), `${gameDirName} loaded, adding to store (${i+1}/${gameDirNames.length})...`);
            _ongoingGamesByName[loadedGame.getName()] = loadedGame;
            initializedGames.push(loadedGame);
        }

        catch(err)
        {
            log.error(log.getLeanLevel(), `Error loading game (${i}/${gameDirNames.length})`, err);
        }
    });

    await Promise.allSettled(promises);

    log.general(log.getLeanLevel(), `All games loaded, starting monitoring...`);
    gameMonitor.monitorDomGames(initializedGames);
    log.general(log.getLeanLevel(), `Monitoring started!`);
};

exports.getGameDataForHostServer = function(hostServer)
{
    let dataPack = [];
    let gamesOnServer = exports.getOngoingGamesOnServer(hostServer);

    gamesOnServer.forEach((game) => 
    {
        dataPack.push(game.getDataPackage());
        game.setServer(hostServer);
    });

    return dataPack;
};

exports.getOngoingGamesOnServer = function(hostServer)
{
    const games = [];

    for (let gameName in _ongoingGamesByName)
    {
        const game = _ongoingGamesByName[gameName];

        if (game.getServerId() === hostServer.getId())
            games.push(game);
    }

    return games;
};

exports.getNbrOfGamesOnServer = function(hostServer)
{
    return exports.getOngoingGamesOnServer(hostServer).length;
};

exports.addOngoingGame = function(game)
{
    assert.isInstanceOfPrototypeOrThrow(game, Game);
    _ongoingGamesByName[game.getName()] = game;
    gameMonitor.monitorDomGame(game);
};

exports.deleteGame = async function(gameName)
{
    const game = exports.getOngoingGameByName(gameName);
    const pathToBotData = `${config.dataPath}/${config.gameDataFolder}/${gameName}`;

    // Stop monitoring game as first step, because game updates force game data saves,
    // which might result in the game data not actually being deleted, as a save triggers
    // right after being deleted and recreates the files
    if (game != null)
        gameMonitor.stopMonitoringDomGame(game);

    try {
        await fsp.rm(pathToBotData, { recursive: true} );

        if (game == null)
        {
            log.general(log.getLeanLevel(), `Game ${gameName} to delete is already null on the store`);
            return Promise.resolve();
        }
    
        delete _ongoingGamesByName[gameName];
        log.general(log.getNormalLevel(), `Deleted ${gameName}'s bot data.`);
    }
    
    catch(err)
    {
        log.error(log.getLeanLevel(), `ERROR: Could not remove ${gameName} from the store`, err);
        throw err;
    }
};

exports.getOngoingGameByName = function(nameToFind) 
{
    if (assert.isString(nameToFind) === false)
        return null;
        
    return _findGameByName(nameToFind); 
};

exports.hasOngoingGameByName = function(nameToFind) 
{
    return _findGameByName(nameToFind) != null; 
};

exports.isNameAvailable = function(name)
{
    return exports.hasOngoingGameByName(name) === false && activeMenuStore.hasHostingInstanceWithGameNameReserved(name) === false;
};

exports.getOngoingGameByChannel = function(channelId) 
{
    return _findGameByChannel(channelId); 
};

exports.channelHasOngoingGame = function(channelId) 
{
    return _findGameByChannel(channelId) != null; 
};

exports.getArrayOfGames = function()
{
    let arr = [];

    for (let name in _ongoingGamesByName)
    {
        let game = _ongoingGamesByName[name];
        arr.push(game);
    }
    
    return arr;
};

exports.forEachGame = function(fnToApply)
{
    assert.isFunctionOrThrow(fnToApply);

    for (let name in _ongoingGamesByName)
    {
        let game = _ongoingGamesByName[name];
        fnToApply(game, name);
    }
};

exports.filterGames = function(fnToApply)
{
    const filteredGames = [];
    assert.isFunctionOrThrow(fnToApply);

    for (let name in _ongoingGamesByName)
    {
        let game = _ongoingGamesByName[name];
        if (fnToApply(game, name) === true)
            filteredGames.push(game);
    }

    return filteredGames;
};

exports.getGamesWhereUserIsPlayer = function(userId)
{
    const games = exports.filterGames((game) => game.isMemberPlayer(userId) === true);
    return games;
};

exports.getGamesWhereUserIsOrganizer = function(userId)
{
    const games = exports.filterGames((game) => game.getOrganizerId() === userId);
    return games;
};


function _findGameByName(nameToFind)
{
    for (let name in _ongoingGamesByName)
    {
        if (name.toLowerCase() === nameToFind.toLowerCase())
            return _ongoingGamesByName[name];
    }
}

function _findGameByChannel(channelId)
{
    for (let name in _ongoingGamesByName)
    {
        let game = _ongoingGamesByName[name];

        if (game.getChannelId() != null && game.getChannelId() === channelId)
            return game;
    }
}