
const assert = require("../../asserter.js");
const rw = require("../../reader_writer.js");
import { PlayerPreferences, revivePlayerPreferencesFromJSON } from "./player_preferences.js";

export { loadAll, revivePlayerGamePreferencesFromJSON, PlayerGamePreferences }

function loadAll()
{
    var revivedData = [];
    var dirPath = config.pathToPlayerGamePreferences;
    var subfolderNames = rw.getDirSubfolderNamesSync(dirPath);

    subfolderNames.forEach((subfolderName) =>
    {
        var subfolderContents = rw.readDirContentsSync(`${dirPath}/${subfolderName}`);

        subfolderContents.forEach((stringData) =>
        {
            var parsedJSON = JSON.parse(stringData);
            var revivedJSON = revivePlayerGamePreferencesFromJSON(parsedJSON);
            revivedData.push(revivedJSON);
        });
    });

    return revivedData;
};

function revivePlayerGamePreferencesFromJSON(jsonData)
{
    assert.isObjectOrThrow(jsonData);

    var preferences = revivePlayerPreferencesFromJSON(jsonData);
    var gamePreferences = new PlayerGamePreferences(jsonData.name);

    gamePreferences.setPreferencesObject(preferences);

    return gamePreferences;
}

function PlayerGamePreferences(playerId, gameName)
{
    assert.isStringOrThrow(gameName);

    const _gameName = gameName;
    const _preferences = new PlayerPreferences(playerId);

    _preferences.getName = () => _gameName;
    _preferences.setPreferencesObject = (preferences) =>
    {
        assert.isInstanceOfPrototypeOrThrow(preferences, PlayerPreferences);
        _preferences = preferences;
    };

    this.save = () =>
    {
        var path = `${config.pathToPlayerGamePreferences}/${_playerId}/${_gameName}.json`;
        var dataToSave = _convertToJSON();

        return rw.saveJSON(path, dataToSave)
        .catch((err) => 
        {
            rw.log("error", `Could not save ${_gameName}'s player ${_playerId} preferences: ${err.message}`);
            return Promise.resolve();
        });
    };

    function _convertToJSON()
    {
        var preferences = this.toJSON();
        preferences.gameName = _gameName;

        return preferences;
    }

    return _preferences;
}