
const fsp = require("fs").promises;
const assert = require("../../asserter.js");
const config = require("../../config/config.json");

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

    this.removeGameData = (gameName) =>
    {
        _arrayOfGameData.forEach((gameData, index) =>
        {
            if (gameData.getGameName() === gameName)
                _arrayOfGameData.splice(index, 1, gameDataToAdd);
        });
    };


    this.isReceivingScoresInGame = (gameName) =>
    {
        const gameData = this.getGameData(gameName);
        return gameData.isReceivingScoresInGame();
    };

    this.setReceivesScoresInGame = (gameName, boolean) =>
    {
        const gameData = this.getGameData(gameName);
        return gameData.setReceiveScores(boolean);
    };


    this.isReceivingBackupsInGame = (gameName) =>
    {
        const gameData = this.getGameData(gameName);
        return gameData.isReceivingBackupsInGame();
    };

    this.setReceivesBackupsInGame = (gameName, boolean) =>
    {
        const gameData = this.getGameData(gameName);
        return gameData.setReceiveBackups(boolean);
    };


    this.isReceivingRemindersWhenTurnIsDoneInGame = (gameName) =>
    {
        const gameData = this.getGameData(gameName);
        return gameData.isReceivingRemindersWhenTurnIsDoneInGame();
    };

    this.setReceivesRemindersWhenTurnInGame = (gameName, boolean) =>
    {
        const gameData = this.getGameData(gameName);
        return gameData.setReceiveRemindersWhenTurnIsDone(boolean);
    };


    this.doesHaveReminderAtHourMarkInGame = (gameName, hourMark) =>
    {
        const gameData = this.getGameData(gameName);
        return gameData.hasReminderAtHourMarkInGame(hourMark);
    };

    this.addReminderAtHourMarkInGame = (gameName, hourMark) =>
    {
        const gameData = this.getGameData(gameName);
        return gameData.addReminderAtHourMark(hourMark);
    };

    this.removeReminderAtHourMarkInGame = (gameName, hourMark) =>
    {
        const gameData = this.getGameData(gameName);
        return gameData.removeReminderAtHourMark(hourMark);
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

        if (gameData.getNationsControlledByPlayer().length <= 0)
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
        const arrayOfGameDataToJSON = [];
        _arrayOfGameData.forEach((gameData) => arrayOfGameDataToJSON.push(gameData.toJSON()));

        return {
            playerId: _playerId,
            arrayOfGameData: arrayOfGameDataToJSON,
            globalPreferences: _globalPreferences.toJSON()
        };
    };

    this.save = () =>
    {
        const filePath = `${config.dataPath}/${config.playerDataFolder}/${_playerId}.json`;
    
        return fsp.writeFile(filePath, JSON.stringify(this, null, 2))
        .catch((err) => Promise.reject(err));
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