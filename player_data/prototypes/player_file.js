
const assert = require("../../asserter.js");

const DominionsPreferences = require("./dominions_preferences.js");
const PlayerGameData = require("./player_game_data.js");

module.exports = PlayerFile;

function PlayerFile(playerId)
{
    const _playerId = playerId;
    const _arrayOfGameData = [];
    var _globalPreferences = new DominionsPreferences(playerId, "global");

    this.getId = () => _playerId;

    this.getGlobalPreferences = () => _globalPreferences;
    this.setGlobalPreferences = (dominionsPreferences) =>
    {
        assert.isInstanceOfPrototypeOrThrow(dominionsPreferences, DominionsPreferences);
        _globalPreferences = dominionsPreferences;
    };

    this.hasGameData = (gameName) => _arrayOfGameData.find((gameData) => gameData.getGameName() === gameName) != null;
    this.getGameData = (gameName) => _arrayOfGameData.find((gameData) => gameData.getGameName() === gameName);
    this.addNewGameData = (gameName) =>
    {
        const newGameData = new PlayerGameData(_playerId, gameName);
        return _addGameData(newGameData);
    };

    this.loadGameData = (gameData) => _addGameData(gameData);

    this.toJSON = () =>
    {
        const arrayOfGameDataToJSON = [];
        _arrayOfGameData.forEach((gameData) => arrayOfGameDataToJSON.push(gameData.toJSON()));

        return {
            playerId: _playerId,
            arrayOfGameData: arrayOfGameDataToJSON,
            globalPreferences: _globalPreferences.toJSON()
        };
    };

    function _addGameData(gameDataToAdd)
    {
        var alreadyExisted = false;
        
        _arrayOfGameData.forEach((gameData, index) =>
        {
            if (gameData.getGameName() === gameDataToAdd.getGameName())
            {
                _arrayOfGameData.splice(index, 1, gameDataToAdd);
                alreadyExisted = true;
            }
        });

        if (alreadyExisted === false)
            _arrayOfGameData.push(gameDataToAdd);

        return gameDataToAdd;
    }
}

PlayerFile.loadFromJSON = (jsonData) =>
{
    const globalPreferences = DominionsPreferences.loadFromJSON(jsonData.globalPreferences);
    const playerFile = new PlayerFile(jsonData.playerId);

    playerFile.setGlobalPreferences(globalPreferences);

    jsonData.arrayOfGameData.forEach((jsonGameData) => 
    {
        const loadedGameData = PlayerGameData.loadFromJSON(jsonGameData);
        playerFile.loadGameData(loadedGameData);
    });

    return playerFile;
};