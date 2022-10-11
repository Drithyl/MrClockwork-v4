
const fsp = require("fs").promises;
const assert = require("../../asserter.js");
const config = require("../../config/config.json");

const DominionsPreferences = require("./dominions_preferences.js");
const PlayerGameData = require("./player_game_data.js");

module.exports = PlayerFile;

function PlayerFile(playerId)
{
    const _playerId = playerId;
    const _gameDataByGameName = {};
    const _preferencesByGameName = {
        global: new DominionsPreferences(playerId, "global") 
    };

    this.getId = () => _playerId;

    this.getGlobalPreferences = () => _preferencesByGameName.global;
    this.setGlobalPreferences = (dominionsPreferences) =>
    {
        assert.isInstanceOfPrototypeOrThrow(dominionsPreferences, DominionsPreferences);
        _preferencesByGameName.global = dominionsPreferences;
    };

    this.hasGameData = (gameName) => _gameDataByGameName[gameName] != null;
    this.getGameData = (gameName) => _gameDataByGameName[gameName];
    this.getAllGameData = () => _gameDataByGameName;

    this.addNewGameData = (gameName) =>
    {
        const newGameData = new PlayerGameData(_playerId, gameName);
        return _addGameData(newGameData);
    };

    this.removeGameData = (gameName) => delete _gameDataByGameName[gameName];

    this.hasGamePreferences = (gameName) => _preferencesByGameName[gameName] != null;
    this.getGamePreferences = (gameName) => _preferencesByGameName[gameName];
    this.getAllGamePreferences = () => 
    {
        // Fill up empty game preferences in games where the player controls nations
        for (var gameName in _gameDataByGameName)
        {
            if (this.hasGamePreferences(gameName) === false)
            {
                if (this.getControlledNationFilenamesInGame(gameName).length > 0)
                {
                    this.setGamePreferences(gameName, new DominionsPreferences(_playerId));
                }
            }
        }

        return _preferencesByGameName;
    };

    this.getEffectiveGamePreferences = (gameName) => 
    {
        if (this.hasGamePreferences(gameName) === true)
            return this.getGamePreferences(gameName);

        else return this.getGlobalPreferences();
    };

    this.setGamePreferences = (gameName, gamePreferences) =>
    {
        assert.isInstanceOfPrototypeOrThrow(gamePreferences, DominionsPreferences);
        _preferencesByGameName[gameName] = gamePreferences;
    };

    this.removeGamePreferences = (gameName) => delete _preferencesByGameName[gameName];


    this.getControlledNationFilenamesInGame = (gameName) =>
    {
        if (this.hasGameData(gameName) === false)
            return [];

        const gameData = this.getGameData(gameName);
        return gameData.getNationFilenamesControlledByPlayer();
    };

    this.isControllingNationInGame = (nationFilename, gameName) =>
    {
        if (this.hasGameData(gameName) === false)
            return false;

        const gameData = this.getGameData(gameName);
        return gameData.isControllingNation(nationFilename);
    };

    this.addControlledNationInGame = (nationFilename, gameName) =>
    {
        if (this.hasGameData(gameName) === false)
            this.addNewGameData(gameName);

        if (this.hasGamePreferences(gameName) === false)
            this.setGamePreferences(gameName, new DominionsPreferences(_playerId));

        const gameData = this.getGameData(gameName);
        gameData.addControlledNation(nationFilename);
        return this.save();
    };

    this.removeControlOfNationInGame = (nationFilename, gameName) =>
    {
        if (this.hasGameData(gameName) === false)
            return Promise.resolve();

        const gameData = this.getGameData(gameName);
        gameData.removeControlOfNation(nationFilename);

        if (gameData.getNationFilenamesControlledByPlayer().length <= 0)
            this.removeGameData(gameName);
        
        return this.save();
    };

    this.removeControlOfAllNationsInGame = (gameName) =>
    {
        if (this.hasGameData(gameName) === false)
            return Promise.resolve();

        const gameData = this.getGameData(gameName);
        gameData.removeControlOfAllNations();

        return this.save();
    };

    this.loadGameData = (gameData) => _addGameData(gameData);

    this.toJSON = () =>
    {
        const gameDataObjectToJSON = {};
        const preferencesObjectToJSON = {};
        
        _gameDataByGameName.forEachItem((gameData, gameName) => gameDataObjectToJSON[gameName] = gameData.toJSON());
        _preferencesByGameName.forEachItem((preferences, gameName) => preferencesObjectToJSON[gameName] = preferences.toJSON());

        return {
            playerId: _playerId,
            gameDataByGameName: gameDataObjectToJSON,
            preferencesByGameName: preferencesObjectToJSON
        };
    };

    this.save = async () =>
    {
        const filePath = `${config.dataPath}/${config.playerDataFolder}/${_playerId}.json`;
        const newFilePath = `${filePath}.new`;
        const data = JSON.stringify(this, null, 2);

        await fsp.writeFile(newFilePath, data);
        await fsp.rename(newFilePath, filePath);
    };

    function _addGameData(gameDataToAdd)
    {
        assert.isInstanceOfPrototypeOrThrow(gameDataToAdd, PlayerGameData);
        
        const gameName = gameDataToAdd.getGameName();
        _gameDataByGameName[gameName] = gameDataToAdd;
    }
}

PlayerFile.loadFromJSON = (jsonData) =>
{
    const playerFile = new PlayerFile(jsonData.playerId);

    jsonData.gameDataByGameName.forEachItem((jsonGameData) => 
    {
        const loadedGameData = PlayerGameData.loadFromJSON(jsonGameData);
        playerFile.loadGameData(loadedGameData);
    });

    jsonData.preferencesByGameName.forEachItem((jsonPreferences, gameName) => 
    {
        const loadedPreferences = DominionsPreferences.loadFromJSON(jsonPreferences);
        playerFile.setGamePreferences(gameName, loadedPreferences);
    });

    return playerFile;
};