
const assert = require("../../asserter.js");

const DominionsPreferences = require("./dominions_preferences.js");
const PlayerGameData = require("./player_game_data.js");

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

    this.hasGameData = (gameName) => _arrayOfGameData.find((gameData) => gameData.getName() === gameName) != null;
    this.getGameData = (gameName) => _arrayOfGameData.find((gameData) => gameData.getName() === gameName);
    this.addGameData = (newGameData) =>
    {
        assert.isInstanceOfPrototypeOrThrow(newGameData, PlayerGameData);

        _arrayOfGameData.forEach((gameData, index) =>
        {
            if (gameData.getName() === newGameData.getName())
                _arrayOfGameData.splice(index, 1, newGameData);
        });
    };

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
}

PlayerFile.loadFromJSON = (jsonData) =>
{
    const globalPreferences = DominionsPreferences.loadFromJSON(jsonData.globalPreferences);
    const playerFile = new PlayerFile(jsonData.playerId);

    playerFile.setGlobalPreferences(globalPreferences);

    arrayOfGameData.forEach((jsonGameData) => 
    {
        playerFile.addGameData(PlayerGameData.loadFromJSON(jsonGameData));
    });

    return playerFile;
};