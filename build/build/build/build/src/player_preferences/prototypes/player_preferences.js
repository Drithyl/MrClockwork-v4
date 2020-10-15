"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++)
        s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerPreferences = exports.revivePlayerPreferencesFromJSON = exports.loadAll = void 0;
var assert = require("../../asserter.js");
var rw = require("../../reader_writer.js");
function loadAll() {
    var revivedData = [];
    var dirPath = config.pathToPlayerGamePreferences;
    var dirContents = rw.readDirContentsSync(dirPath);
    dirContents.forEach(function (stringData) {
        var parsedJSON = JSON.parse(stringData);
        var revivedJSON = revivePlayerPreferencesFromJSON(parsedJSON);
        revivedData.push(revivedJSON);
    });
    return revivedData;
}
exports.loadAll = loadAll;
;
function revivePlayerPreferencesFromJSON(jsonData) {
    assert.isObjectOrThrow(jsonData);
    assert.isArrayOrThrow(jsonData.reminders);
    var preferences = new PlayerPreferences(jsonData.playerId);
    for (var i = 0; i < jsonData.reminders.length; i++) {
        var reminderHourMark = jsonData.reminders[i];
        preferences.addReminderAtHourMark(reminderHourMark);
    }
    preferences.setReceiveScores(jsonData.receiveScores);
    preferences.setReceiveBackups(jsonData.receiveBackups);
    preferences.setReceiveRemindersWhenTurnIsDone(jsonData.receiveReminderWhenTurnIsDone);
    return preferences;
}
exports.revivePlayerPreferencesFromJSON = revivePlayerPreferencesFromJSON;
function PlayerPreferences(playerId) {
    var _this = this;
    assert.isStringOrThrow(playerId);
    var _playerId = playerId;
    var _reminders = [];
    var _receiveScores = false;
    var _receiveBackups = false;
    var _receiveReminderWhenTurnIsDone = false;
    this.getPlayerId = function () { return _playerId; };
    this.hasReminderAtHourMark = function (hourMark) { return _reminders.includes(hourMark); };
    this.addReminderAtHourMark = function (hourMark) {
        assert.isIntegerOrThrow(hourMark);
        _reminders.push(hourMark);
    };
    this.removeReminderAtHourMark = function (hourMark) {
        for (var i = _reminders.length - 1; i >= 0; i--)
            if (_reminders[i] == hourMark)
                _reminders.splice(i, 1);
    };
    this.isReceivingScores = function () { return _receiveScores; };
    this.isReceivingBackups = function () { return _receiveBackups; };
    this.isReceivingRemindersWhenTurnIsDone = function () { return _receiveReminderWhenTurnIsDone; };
    this.setReceiveScores = function (boolean) {
        assert.isBooleanOrThrow(boolean);
        _receiveScores = boolean;
    };
    this.setReceiveBackups = function (boolean) {
        assert.isBooleanOrThrow(boolean);
        _receiveScores = boolean;
    };
    this.setReceiveRemindersWhenTurnIsDone = function (boolean) {
        assert.isBooleanOrThrow(boolean);
        _receiveScores = boolean;
    };
    this.save = function () {
        var path = config.pathToGlobalPreferences + "/" + _playerId + ".json";
        var dataToSave = _this.toJSON();
        return rw.saveJSON(path, dataToSave)
            .catch(function (err) {
            rw.log("error", "Could not save player's " + _playerId + " global preferences: " + err.message);
            return Promise.resolve();
        });
    };
    this.toJSON();
    {
        return {
            playerId: _preferences.getPlayerId(),
            reminders: __spreadArrays(_reminders),
            receiveScores: _receiveScores,
            receiveBackups: _receiveBackups,
            receiveReminderWhenTurnIsDone: _receiveReminderWhenTurnIsDone
        };
    }
}
exports.PlayerPreferences = PlayerPreferences;
//# sourceMappingURL=player_preferences.js.map