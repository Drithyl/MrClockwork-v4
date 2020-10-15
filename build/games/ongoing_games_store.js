"use strict";
var assert = require("../asserter.js");
var rw = require("../reader_writer.js");
var Game = require("./prototypes/game.js");
var config = require("../config/config.json");
var gameFactory = require("./game_factory.js");
var activeMenuStore = require("../menus/active_menu_store.js");
var _ongoingGamesByName = {};
exports.loadAll = function () {
    var pathToGameDataDir = config.pathToGameData;
    var gameDirNames = rw.getDirSubfolderNamesSync(pathToGameDataDir);
    return gameDirNames.forEach(function (gameDirName) {
        var gameJSONDataPath = pathToGameDataDir + "/" + gameDirName + "/data.json";
        var loadedGame = gameFactory.loadGame(gameJSONDataPath);
        exports.addOngoingGame(loadedGame);
    });
};
exports.getGameDataForHostServer = function (hostServer) {
    var dataPack = [];
    var gamesOnServer = _getOngoingGamesByServer(hostServer);
    gamesOnServer.forEach(function (game) {
        dataPack.push(game.getDataPackage());
        game.setServer(hostServer);
    });
    return dataPack;
};
exports.getNbrOfGamesOnServer = function (hostServer) {
    return _getOngoingGamesByServer(hostServer).length;
};
exports.addOngoingGame = function (game) {
    assert.isInstanceOfPrototypeOrThrow(game, Game);
    _ongoingGamesByName[game.getName()] = game;
};
exports.getOngoingGameByName = function (nameToFind) {
    return _findGameByName(nameToFind);
};
exports.hasOngoingGameByName = function (nameToFind) {
    return _findGameByName(nameToFind) != null;
};
exports.isNameAvailable = function (name) {
    return exports.hasOngoingGameByName(name) === false && activeMenuStore.hasHostingInstanceWithGameNameReserved(name) === false;
};
exports.getOngoingGameByChannel = function (channelId) {
    return _findGameByChannel(channelId);
};
exports.channelHasOngoingGame = function (channelId) {
    return _findGameByChannel(channelId) != null;
};
exports.getArrayOfGames = function () {
    var arr = [];
    for (var name in _ongoingGamesByName) {
        var game = _ongoingGamesByName[name];
        arr.push(game);
    }
    return arr;
};
exports.forEachGame = function (fnToApply) {
    assert.isFunctionOrThrow(fnToApply);
    for (var name in _ongoingGamesByName) {
        var game = _ongoingGamesByName[name];
        fnToApply(game, name);
    }
};
function _getOngoingGamesByServer(hostServer) {
    var games = [];
    for (var gameName in _ongoingGamesByName) {
        var game = _ongoingGamesByName[gameName];
        if (game.getServerId() === hostServer.getId())
            games.push(game);
    }
    return games;
}
function _findGameByName(nameToFind) {
    for (var name in _ongoingGamesByName) {
        if (name.toLowerCase() === nameToFind.toLowerCase())
            return _ongoingGamesByName[name];
    }
}
function _findGameByChannel(channelId) {
    for (var name in _ongoingGamesByName) {
        var game = _ongoingGamesByName[name];
        console.log(game);
        if (game.getChannelId() === channelId)
            return game;
    }
}
//# sourceMappingURL=ongoing_games_store.js.map