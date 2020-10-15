"use strict";
var rw = require("../reader_writer.js");
var loadAllPlayerGameData = require("./prototypes/player_game_data").loadAll;
var loadAllPlayerGamePreferences = require("./prototypes/player_game_preferences").loadAll;
var loadAllPlayerGlobalPreferences = require("./prototypes/player_preferences").loadAll;
var _playerGameDataStore = loadAllPlayerGameData();
var _playerGamePreferencesStore = loadAllPlayerGamePreferences();
var _playerGlobalPreferencesStore = loadAllPlayerGlobalPreferences();
exports.isPlayerReceivingScoresGlobal = function (playerId) {
    var playerData = _getPlayerGlobalPreferences(playerId);
    return playerData.isReceivingScores();
};
exports.setPlayerReceivesScoresGlobal = function (playerId, boolean) {
    var playerData = _getPlayerGlobalPreferences(playerId);
    return playerData.setReceiveScores(boolean);
};
exports.isPlayerReceivingBackupsGlobal = function (playerId) {
    var playerData = _getPlayerGlobalPreferences(playerId);
    return playerData.isReceivingBackups();
};
exports.setPlayerReceivesBackupsGlobal = function (playerId, boolean) {
    var playerData = _getPlayerGlobalPreferences(playerId);
    return playerData.setReceiveBackups(boolean);
};
exports.isPlayerReceivingRemindersWhenTurnIsDoneGlobal = function (playerId) {
    var playerData = _getPlayerGlobalPreferences(playerId);
    return playerData.isReceivingRemindersWhenTurnIsDone();
};
exports.setPlayerReceivesRemindersWhenTurnIsDone = function (playerId, boolean) {
    var playerData = _getPlayerGlobalPreferences(playerId);
    return playerData.setReceiveRemindersWhenTurnIsDone(boolean);
};
exports.doesPlayerHaveReminderAtHourMarkGlobal = function (playerId) {
    var playerData = _getPlayerGlobalPreferences(playerId);
    return playerData.hasReminderAtHourMark();
};
exports.addPlayerReminderAtHourMarkGlobal = function (hourMark, playerId) {
    var playerData = _getPlayerGlobalPreferences(playerId);
    return playerData.addReminderAtHourMark(hourMark);
};
exports.removePlayerReminderAtHourMarkGlobal = function (hourMark, playerId) {
    var playerData = _getPlayerGlobalPreferences(playerId);
    return playerData.removeReminderAtHourMark(hourMark);
};
exports.isPlayerReceivingScoresInGame = function (playerId, gameName) {
    var playerData = _getPlayerGamePreferences(playerId, gameName);
    return playerData.isReceivingScoresInGame();
};
exports.setPlayerReceivesScoresInGame = function (playerId, gameName, boolean) {
    var playerData = _getPlayerGamePreferences(playerId, gameName);
    return playerData.setReceiveScores(boolean);
};
exports.isPlayerReceivingBackupsInGame = function (playerId, gameName) {
    var playerData = _getPlayerGamePreferences(playerId, gameName);
    return playerData.isReceivingBackupsInGame();
};
exports.setPlayerReceivesBackupsInGame = function (playerId, gameName, boolean) {
    var playerData = _getPlayerGamePreferences(playerId, gameName);
    return playerData.setReceiveBackups(boolean);
};
exports.isPlayerReceivingRemindersWhenTurnIsDoneInGame = function (playerId, gameName) {
    var playerData = _getPlayerGamePreferences(playerId, gameName);
    return playerData.isReceivingRemindersWhenTurnIsDoneInGame();
};
exports.setPlayerReceivesRemindersWhenTurnInGame = function (playerId, gameName, boolean) {
    var playerData = _getPlayerGamePreferences(playerId, gameName);
    return playerData.setReceiveRemindersWhenTurnIsDone(boolean);
};
exports.doesPlayerHaveReminderAtHourMarkInGame = function (playerId, gameName) {
    var playerData = _getPlayerGamePreferences(playerId, gameName);
    return playerData.hasReminderAtHourMarkInGame();
};
exports.addPlayerReminderAtHourMarkInGame = function (playerId, gameName, hourMark) {
    var playerData = _getPlayerGamePreferences(playerId, gameName);
    return playerData.addReminderAtHourMark(hourMark);
};
exports.removePlayerReminderAtHourMarkInGame = function (playerId, gameName, hourMark) {
    var playerData = _getPlayerGamePreferences(playerId, gameName);
    return playerData.removeReminderAtHourMark(hourMark);
};
exports.doesPlayerControlNationInGame = function (playerId, nationIdentifier, gameName) {
    var playerData = _getPlayerGameData(playerId, gameName);
    return playerData.doesPlayerControlNation(nationIdentifier);
};
exports.addPlayerControlledNationInGame = function (playerId, nationIdentifier, gameName) {
    var playerData = _getPlayerGameData(playerId, gameName);
    return playerData.addControlledNation(nationIdentifier);
};
exports.removePlayerControlOfNationInGame = function (playerId, nationIdentifier, gameName) {
    var playerData = _getPlayerGameData(playerId, gameName);
    return playerData.removePlayerControlOfNation(nationIdentifier);
};
function _getPlayerGameData(playerId, gameName) {
    var data = _getGameData(playerId, gameName, _playerGameDataStore);
    return data;
}
function _getPlayerGamePreferences(playerId, gameName) {
    var data = _getGameData(playerId, gameName, _playerGamePreferencesStore);
    return data;
}
function _getPlayerGlobalPreferences(playerId) {
    for (var i = 0; i < _playerGlobalPreferencesStore.length; i++) {
        var data = _playerGlobalPreferencesStore[i];
        if (data.getPlayerId() === playerId) {
            return data;
        }
    }
}
function _getGameData(playerId, gameName, store) {
    for (var i = 0; i < store.length; i++) {
        var data = store[i];
        if (data.getPlayerId() === playerId && data.getGameName() === gameName) {
            return data;
        }
    }
}
function _getAllGameData(playerId, store) {
    var dataArray = [];
    for (var i = 0; i < store.length; i++) {
        var data = store[i];
        if (data.getPlayerId() === playerId) {
            dataArray.push(data);
        }
    }
    return dataArray;
}
//# sourceMappingURL=player_preferences_store.js.map