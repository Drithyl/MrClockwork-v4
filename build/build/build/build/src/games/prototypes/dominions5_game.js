"use strict";
var Game = require("./game.js");
var config = require("../../config/config.json");
var Dominions5Settings = require("./dominions5_settings.js");
var Dominions5CurrentTimer = require("./dominions5_current_timer.js");
module.exports = Dominions5Game;
function Dominions5Game() {
    var _gameObject = new Game();
    var _currentTimer = new Dominions5CurrentTimer();
    var _intervalFunctionId;
    _gameObject.setSettingsObject(new Dominions5Settings(_gameObject));
    _gameObject.getGameType = function () { return config.dom5GameTypeName; };
    _gameObject.getCurrentTimerObject = function () { return _currentTimer; };
    _gameObject.getDataPackage = function () { return _createGameDataPackage(); };
    _gameObject.fetchStatusDump = function () { return _emitMessageToServer("GET_STATUS_DUMP"); };
    _gameObject.fetchScoreDumpBuffer = function () { return _emitMessageToServer("GET_SCORE_DUMP"); };
    _gameObject.fetchSubmittedPretenders = function () { return _emitMessageToServer("GET_SUBMITTED_PRETENDERS"); };
    _gameObject.fetchNationTurnFile = function (nationFilename) { return _emitMessageToServer("GET_NATION_TURN_FILE", { nationFilename: nationFilename }); };
    _gameObject.deleteGameSavefiles = function () { return _emitMessageToServer("DELETE_GAME_SAVE_FILES"); };
    _gameObject.launchProcess = function () {
        var dataPackage = _createGameDataPackage();
        return _emitMessageToServer("LAUNCH_GAME", dataPackage);
    };
    _gameObject.killProcess = function () {
        var dataPackage = _createGameDataPackage();
        return _emitMessageToServer("KILL_GAME", dataPackage);
    };
    _gameObject.changeCurrentTimer = function (ms) {
        var dataPackage = _createGameDataPackage();
        dataPackage.timer = ms;
        return _emitMessageToServer("changeCurrentTimer", dataPackage);
    };
    _gameObject.addTimeToCurrentTimer = function (ms) {
        var dataPackage = _createGameDataPackage();
        dataPackage.timer = ms + _currentTimer.getLastKnownMsLeft();
        return _emitMessageToServer("changeCurrentTimer", dataPackage);
    };
    _gameObject.changeDefaultTimer = function (ms) {
        var dataPackage = _createGameDataPackage();
        dataPackage.timer = ms;
        return _emitMessageToServer("changeDefaultTimer", dataPackage);
    };
    _gameObject.addTimeToDefaultTimer = function (ms) {
        var dataPackage = _createGameDataPackage();
        dataPackage.timer = ms + _currentTimer.getDefaultTimerInMs();
        return _emitMessageToServer("changeCurrentTimer", dataPackage);
    };
    _gameObject.getScoresFile = function () {
        var dataPackage = _createGameDataPackage();
        return _emitMessageToServer("getScoreDumpBuffer", dataPackage);
    };
    _gameObject.getCurrentTurnFileOfPlayer = function (playerId) {
        //TODO: determine how to identify which nation a player uses
        //Where is player data stored?
    };
    _gameObject.isPlayerOwnerOfPretender = function (guildMemberWrapper, nameOfNation) {
    };
    _gameObject.removePretender = function (nameOfNation) {
    };
    _gameObject.substitutePlayer = function (nameOfNation, idOfNewPlayer) {
    };
    _gameObject.startGame = function () {
        var dataPackage = _createGameDataPackage();
        return _emitMessageToServer("startGame", dataPackage);
    };
    _gameObject.restartGame = function () {
        var dataPackage = _createGameDataPackage();
        return _emitMessageToServer("restartGame", dataPackage)
            .then(function () {
            /*TODO: set hasStarted to false*/
        });
    };
    _gameObject.rollbackTurn = function () {
        var dataPackage = _createGameDataPackage();
        return _emitMessageToServer("rollback", dataPackage);
    };
    _gameObject.startUpdating = function (interval) { return _intervalFunctionId = setInterval(_currentTimer.updateTimer, interval); };
    _gameObject.stopUpdating = function () { return clearInterval(_intervalFunctionId); };
    function _emitMessageToServer(message, dataObjectToSend) {
        var gameName = _gameObject.getName();
        var server = _gameObject.getServer();
        var dataPackage = Object.assign({ name: gameName }, dataObjectToSend);
        return server.emitPromise(message, dataPackage);
    }
    function _createGameDataPackage() {
        var settingsObject = _gameObject.getSettingsObject();
        var dataPackage = {
            name: _gameObject.getName(),
            port: _gameObject.getPort(),
            gameType: _gameObject.getGameType(),
            args: settingsObject.getSettingFlags()
        };
        return dataPackage;
    }
    function _validatePretenders() {
        //TODO: Is this really needed?
    }
    _currentTimer.setNewTurnHandler = function () {
        //TODO: announce new turn to channel
        //send stales to host
        //send score files to players
        //send turn backup to players
    };
    _currentTimer.setNewHourHandler = function () {
        //TODO
    };
    _currentTimer.setLastHourHandler = function () {
        //TODO: announce last hour to channel
    };
    return _gameObject;
}
//# sourceMappingURL=dominions5_game.js.map