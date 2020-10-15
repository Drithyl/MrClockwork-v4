"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerGameData = exports.revivePlayerGameDataFromJSON = exports.loadAll = void 0;
var assert = require("../../asserter.js");
var dominions5NationStore = require("../../games/dominions5_nation_store.js");
function loadAll() {
    var revivedData = [];
    var dirPath = config.pathToPlayerGameData;
    var subfolderNames = rw.getDirSubfolderNamesSync(dirPath);
    subfolderNames.forEach(function (subfolderName) {
        var subfolderContents = rw.readDirContentsSync(dirPath + "/" + subfolderName);
        subfolderContents.forEach(function (stringData) {
            var parsedJSON = JSON.parse(stringData);
            var revivedPlayerGameDataObject = revivePlayerGameDataFromJSON(parsedJSON);
            revivedData.push(revivedPlayerGameDataObject);
        });
    });
    return revivedData;
}
exports.loadAll = loadAll;
;
function revivePlayerGameDataFromJSON(jsonData) {
    assert.isObjectOrThrow(jsonData);
    var gameData = new PlayerGameData(jsonData.playerId, jsonData.gameName, jsonData.controlledNations);
    return gameData;
}
exports.revivePlayerGameDataFromJSON = revivePlayerGameDataFromJSON;
function PlayerGameData(playerId, gameName, arrayOfControlledNationIdentifiers) {
    assert.isStringOrThrow(playerId);
    assert.isStringOrThrow(gameName);
    _assertListOfControlledNations(arrayOfControlledNationIdentifiers);
    var _playerId = playerId;
    var _gameName = gameName;
    var _controlledNationIdentifiers = arrayOfControlledNationIdentifiers;
    this.getPlayerId = function () { return _playerId; };
    this.getGameName = function () { return _gameName; };
    this.doesPlayerControlNation = function (nationIdentifier) {
        var identifier = nationIdentifier.toString().toLowerCase();
        return _controlledNationFilenames.includes(identifier);
    };
    this.addControlledNation = function (nationIdentifier) {
        _assertNationIdentifier(nationIdentifier);
        _controlledNationIdentifiers.push(nationIdentifier);
    };
    this.removePlayerControlOfNation = function (nationIdentifier) {
        for (var i = _controlledNationIdentifiers.length - 1; i >= 0; i--)
            if (_controlledNationIdentifiers[i] == nationIdentifier)
                _controlledNationIdentifiers.splice(i, 1);
    };
    this.save = function () {
        var path = config.pathToPlayerGameData + "/" + _gameName + "/" + _playerId + ".json";
        var dataToSave = _convertToJSON();
        return rw.saveJSON(path, dataToSave)
            .catch(function (err) {
            rw.log("error", "Could not save " + _gameName + "'s player " + _playerId + " data: " + err.message);
            return Promise.resolve();
        });
    };
    function _convertToJSON() {
        return {
            playerId: _playerId,
            gameName: _gameName,
            controlledNations: _controlledNationIdentifiers
        };
    }
}
exports.PlayerGameData = PlayerGameData;
function _assertListOfControlledNations(controlledNations) {
    assert.isArrayOrThrow(controlledNations);
    for (var i = 0; i < controlledNations.length; i++) {
        var nationIdentifier = controlledNations[i];
        _assertNationIdentifier(nationIdentifier);
    }
}
function _assertNationIdentifier(nationIdentifier) {
    if (dominions5NationStore.isValidNationIdentifier(nationIdentifier) === false)
        throw new SemanticError("Invalid nation identifier at index " + i + ".");
}
//# sourceMappingURL=player_game_data.js.map