"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerGamePreferences = exports.revivePlayerGamePreferencesFromJSON = exports.loadAll = void 0;
var assert = require("../../asserter.js");
var rw = require("../../reader_writer.js");
var player_preferences_js_1 = require("./player_preferences.js");
function loadAll() {
    var revivedData = [];
    var dirPath = config.pathToPlayerGamePreferences;
    var subfolderNames = rw.getDirSubfolderNamesSync(dirPath);
    subfolderNames.forEach(function (subfolderName) {
        var subfolderContents = rw.readDirContentsSync(dirPath + "/" + subfolderName);
        subfolderContents.forEach(function (stringData) {
            var parsedJSON = JSON.parse(stringData);
            var revivedJSON = revivePlayerGamePreferencesFromJSON(parsedJSON);
            revivedData.push(revivedJSON);
        });
    });
    return revivedData;
}
exports.loadAll = loadAll;
;
function revivePlayerGamePreferencesFromJSON(jsonData) {
    assert.isObjectOrThrow(jsonData);
    var preferences = player_preferences_js_1.revivePlayerPreferencesFromJSON(jsonData);
    var gamePreferences = new PlayerGamePreferences(jsonData.name);
    gamePreferences.setPreferencesObject(preferences);
    return gamePreferences;
}
exports.revivePlayerGamePreferencesFromJSON = revivePlayerGamePreferencesFromJSON;
function PlayerGamePreferences(playerId, gameName) {
    assert.isStringOrThrow(gameName);
    var _gameName = gameName;
    var _preferences = new player_preferences_js_1.PlayerPreferences(playerId);
    _preferences.getName = function () { return _gameName; };
    _preferences.setPreferencesObject = function (preferences) {
        assert.isInstanceOfPrototypeOrThrow(preferences, player_preferences_js_1.PlayerPreferences);
        _preferences = preferences;
    };
    this.save = function () {
        var path = config.pathToPlayerGamePreferences + "/" + _playerId + "/" + _gameName + ".json";
        var dataToSave = _convertToJSON();
        return rw.saveJSON(path, dataToSave)
            .catch(function (err) {
            rw.log("error", "Could not save " + _gameName + "'s player " + _playerId + " preferences: " + err.message);
            return Promise.resolve();
        });
    };
    function _convertToJSON() {
        var preferences = this.toJSON();
        preferences.gameName = _gameName;
        return preferences;
    }
    return _preferences;
}
exports.PlayerGamePreferences = PlayerGamePreferences;
//# sourceMappingURL=player_game_preferences.js.map