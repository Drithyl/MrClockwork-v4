
const rw = require("../reader_writer.js");

const loadAllPlayerGameData = require("./prototypes/player_game_data").loadAll;
const loadAllPlayerGamePreferences = require("./prototypes/player_game_preferences").loadAll;
const loadAllPlayerGlobalPreferences = require("./prototypes/player_preferences").loadAll;

const _playerGameDataStore = loadAllPlayerGameData();
const _playerGamePreferencesStore = loadAllPlayerGamePreferences();
const _playerGlobalPreferencesStore = loadAllPlayerGlobalPreferences();

exports.isPlayerReceivingScoresGlobal = (playerId) =>
{
    var playerData = _getPlayerGlobalPreferences(playerId);
    return playerData.isReceivingScores();
};

exports.setPlayerReceivesScoresGlobal = (playerId, boolean) =>
{
    var playerData = _getPlayerGlobalPreferences(playerId);
    return playerData.setReceiveScores(boolean);
};


exports.isPlayerReceivingBackupsGlobal = (playerId) =>
{
    var playerData = _getPlayerGlobalPreferences(playerId);
    return playerData.isReceivingBackups();
};

exports.setPlayerReceivesBackupsGlobal = (playerId, boolean) =>
{
    var playerData = _getPlayerGlobalPreferences(playerId);
    return playerData.setReceiveBackups(boolean);
};


exports.isPlayerReceivingRemindersWhenTurnIsDoneGlobal = (playerId) =>
{
    var playerData = _getPlayerGlobalPreferences(playerId);
    return playerData.isReceivingRemindersWhenTurnIsDone();
};

exports.setPlayerReceivesRemindersWhenTurnIsDone = (playerId, boolean) =>
{
    var playerData = _getPlayerGlobalPreferences(playerId);
    return playerData.setReceiveRemindersWhenTurnIsDone(boolean);
};


exports.doesPlayerHaveReminderAtHourMarkGlobal = (playerId) =>
{
    var playerData = _getPlayerGlobalPreferences(playerId);
    return playerData.hasReminderAtHourMark();
};

exports.addPlayerReminderAtHourMarkGlobal = (hourMark, playerId) =>
{
    var playerData = _getPlayerGlobalPreferences(playerId);
    return playerData.addReminderAtHourMark(hourMark);
};

exports.removePlayerReminderAtHourMarkGlobal = (hourMark, playerId) =>
{
    var playerData = _getPlayerGlobalPreferences(playerId);
    return playerData.removeReminderAtHourMark(hourMark);
};



exports.isPlayerReceivingScoresInGame = (playerId, gameName) =>
{
    var playerData = _getPlayerGamePreferences(playerId, gameName);
    return playerData.isReceivingScoresInGame();
};

exports.setPlayerReceivesScoresInGame = (playerId, gameName, boolean) =>
{
    var playerData = _getPlayerGamePreferences(playerId, gameName);
    return playerData.setReceiveScores(boolean);
};


exports.isPlayerReceivingBackupsInGame = (playerId, gameName) =>
{
    var playerData = _getPlayerGamePreferences(playerId, gameName);
    return playerData.isReceivingBackupsInGame();
};

exports.setPlayerReceivesBackupsInGame = (playerId, gameName, boolean) =>
{
    var playerData = _getPlayerGamePreferences(playerId, gameName);
    return playerData.setReceiveBackups(boolean);
};


exports.isPlayerReceivingRemindersWhenTurnIsDoneInGame = (playerId, gameName) =>
{
    var playerData = _getPlayerGamePreferences(playerId, gameName);
    return playerData.isReceivingRemindersWhenTurnIsDoneInGame();
};

exports.setPlayerReceivesRemindersWhenTurnInGame = (playerId, gameName, boolean) =>
{
    var playerData = _getPlayerGamePreferences(playerId, gameName);
    return playerData.setReceiveRemindersWhenTurnIsDone(boolean);
};


exports.doesPlayerHaveReminderAtHourMarkInGame = (playerId, gameName) =>
{
    var playerData = _getPlayerGamePreferences(playerId, gameName);
    return playerData.hasReminderAtHourMarkInGame();
};

exports.addPlayerReminderAtHourMarkInGame = (playerId, gameName, hourMark) =>
{
    var playerData = _getPlayerGamePreferences(playerId, gameName);
    return playerData.addReminderAtHourMark(hourMark);
};

exports.removePlayerReminderAtHourMarkInGame = (playerId, gameName, hourMark) =>
{
    var playerData = _getPlayerGamePreferences(playerId, gameName);
    return playerData.removeReminderAtHourMark(hourMark);
};



exports.doesPlayerControlNationInGame = (playerId, nationIdentifier, gameName) =>
{
    var playerData = _getPlayerGameData(playerId, gameName);
    return playerData.doesPlayerControlNation(nationIdentifier);
};

exports.addPlayerControlledNationInGame = (playerId, nationIdentifier, gameName) =>
{
    var playerData = _getPlayerGameData(playerId, gameName);
    return playerData.addControlledNation(nationIdentifier);
};

exports.removePlayerControlOfNationInGame = (playerId, nationIdentifier, gameName) =>
{
    var playerData = _getPlayerGameData(playerId, gameName);
    return playerData.removePlayerControlOfNation(nationIdentifier);
};



function _getPlayerGameData(playerId, gameName)
{
    var data = _getGameData(playerId, gameName, _playerGameDataStore);
    return data;
}

function _getPlayerGamePreferences(playerId, gameName)
{
    var data = _getGameData(playerId, gameName, _playerGamePreferencesStore);
    return data;
}

function _getPlayerGlobalPreferences(playerId)
{
    for (var i = 0; i < _playerGlobalPreferencesStore.length; i++)
    {
        var data = _playerGlobalPreferencesStore[i];
        
        if (data.getPlayerId() === playerId)
        {
            return data;
        }
    }
}

function _getGameData(playerId, gameName, store)
{
    for (var i = 0; i < store.length; i++)
    {
        var data = store[i];
        
        if (data.getPlayerId() === playerId && data.getGameName() === gameName)
        {
            return data;
        }
    }
}

function _getAllGameData(playerId, store)
{
    var dataArray = [];

    for (var i = 0; i < store.length; i++)
    {
        var data = store[i];
        
        if (data.getPlayerId() === playerId)
        {
            dataArray.push(data);
        }
    }

    return dataArray;
}