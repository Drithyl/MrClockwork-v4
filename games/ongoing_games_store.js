

const assert = require("../asserter.js");
const rw = require("../reader_writer.js");
const Game = require("./prototypes/game.js");
const config = require("../config/config.json");
const gameFactory = require("./game_factory.js");
const gameMonitor = require("./game_monitor.js");
const activeMenuStore = require("../menus/active_menu_store.js");

const _ongoingGamesByName = {};


exports.loadAll = function()
{
    var pathToGameDataDir = `${config.dataPath}/${config.gameDataFolder}`;
    var gameDirNames = rw.getDirSubfolderNamesSync(pathToGameDataDir);
    
    return gameDirNames.forEach((gameDirName) =>
    {
        var gameJSONDataPath = `${pathToGameDataDir}/${gameDirName}/data.json`;
        var loadedGame = gameFactory.loadGame(gameJSONDataPath);
        
        exports.addOngoingGame(loadedGame);
    });
};

exports.getGameDataForHostServer = function(hostServer)
{
    var dataPack = [];
    var gamesOnServer = _getOngoingGamesByServer(hostServer);

    gamesOnServer.forEach((game) => 
    {
        dataPack.push(game.getDataPackage());
        game.setServer(hostServer);
    });

    return dataPack;
};

exports.getNbrOfGamesOnServer = function(hostServer)
{
    return _getOngoingGamesByServer(hostServer).length;
};

exports.addOngoingGame = function(game)
{
    assert.isInstanceOfPrototypeOrThrow(game, Game);
    _ongoingGamesByName[game.getName()] = game;
    gameMonitor.monitorDom5Game(game);
};

exports.deleteGame = function(gameName)
{
    const game = exports.getOngoingGameByName(gameName);
    const pathToBotData = `${config.dataPath}/${config.gameDataFolder}/${gameName}`;

    if (game == null)
        return Promise.resolve();

    gameMonitor.stopMonitoringDom5Game(game);

    return game.removeAllPlayerData()
    .then(() => rw.deleteDir(pathToBotData))
    .then(() =>
    {
        delete _ongoingGamesByName[gameName];
        console.log(`Deleted ${gameName}'s bot data.`);
        return Promise.resolve();
    })
    .catch((err) => Promise.reject(err));
};

exports.getOngoingGameByName = function(nameToFind) 
{
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
    var arr = [];

    for (var name in _ongoingGamesByName)
    {
        let game = _ongoingGamesByName[name];
        arr.push(game);
    }

    return arr;
};

exports.forEachGame = function(fnToApply)
{
    assert.isFunctionOrThrow(fnToApply);

    for (var name in _ongoingGamesByName)
    {
        let game = _ongoingGamesByName[name];
        fnToApply(game, name);
    }
};

function _getOngoingGamesByServer(hostServer) 
{ 
    var games = [];

    for (var gameName in _ongoingGamesByName)
    {
        var game = _ongoingGamesByName[gameName];

        if (game.getServerId() === hostServer.getId())
            games.push(game);
    }

    return games;
}

function _findGameByName(nameToFind)
{
    for (var name in _ongoingGamesByName)
    {
        if (name.toLowerCase() === nameToFind.toLowerCase())
            return _ongoingGamesByName[name];
    }
}

function _findGameByChannel(channelId)
{
    for (var name in _ongoingGamesByName)
    {
        let game = _ongoingGamesByName[name];

        if (game.getChannelId() === channelId)
            return game;
    }
}