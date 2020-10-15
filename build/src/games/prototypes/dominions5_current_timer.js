"use strict";
var assert = require("../../asserter.js");
var Timer = require("../../time_left_prototype.js");
var queryDominions5Game = require("./dominions5_tcp_query.js");
var TimerSetting = require("../../game_settings/dom5/prototypes/timer.js");
module.exports = Dominions5CurrentTimer;
function Dominions5CurrentTimer(msLeft, currentTurnNumber) {
    if (currentTurnNumber === void 0) { currentTurnNumber = 0; }
    var _lastKnownTurnNumber = 0;
    var _lastKnownMsLeftForNewTurn = 0;
    var _lastCheckDateInMs = 0;
    var _timerSettingObject;
    var _newTurnHandler = function () { };
    var _newHourHandler = function () { };
    var _lastHourHandler = function () { };
    this.getLastKnownMsLeft = function () { return _lastKnownMsLeftForNewTurn; };
    this.getLastKnownTurnNumber = function () { return _lastKnownTurnNumber; };
    this.getDefaultTimerInMs = function () { return _timerSettingObject.getValue(); };
    this.setDefaultTimer = function (timerSettingObject) {
        assert.isInstanceOfPrototype(timerSettingObject, TimerSetting);
        _timerSettingObject = timerSettingObject;
    };
    this.setToDefault = function () { return _msLeft = _timerSettingObject.getValue(); };
    this.setNewTurnHandler = function (handler) {
        assert.isFunctionOrThrow(handler);
        _newTurnHandler = handler;
    };
    this.setNewHourHandler = function (handler) {
        assert.isFunctionOrThrow(handler);
        _newHourHandler = handler;
    };
    this.setLastHourHandler = function (handler) {
        assert.isFunctionOrThrow(handler);
        _lastHourHandler = handler;
    };
    this.updateTimer = function () {
        return queryDominions5Game(_gameObject)
            .then(function (tcpQueryResponse) {
            var storedLastKnownTurnNumber = _lastKnownTurnNumber;
            var storedLastKnownMsLeftForNewTurn = _lastKnownMsLeftForNewTurn;
            var updatedMs = tcpQueryResponse.getMsLeft();
            var updatedTurnNumber = tcpQueryResponse.getCurrentTurnNumber();
            _lastKnownMsLeftForNewTurn = updatedMs;
            _lastKnownTurnNumber = updatedTurnNumber;
            _lastCheckDateInMs = Date.now();
            if (isNewTurn(storedLastKnownTurnNumber, updatedTurnNumber) === true)
                return _newTurnHandler(updatedMs, updatedTurnNumber);
            else if (isLastHour(storedLastKnownMsLeftForNewTurn, updatedMs) === true)
                return _lastHourHandler(updatedMs);
            else if (anHourWentBy(storedLastKnownMsLeftForNewTurn, updatedMs) === true)
                return _newHourHandler(updatedMs);
        });
    };
    this.printTimeLeft = function () {
        var lastKnownTimeLeft = new Timer(_lastKnownMsLeftForNewTurn);
        var lastCheck = new Timer(_lastCheckDateInMs);
        return commandContext.respondToCommand("It is turn " + _lastKnownTurnNumber + ". There are " + lastKnownTimeLeft.printTimeLeft() + " (last checked " + lastCheck.printTimeLeftShort() + " ago).");
    };
    this.printDefaultTimer = function () {
        var defaultTimer = new Timer(_timerSettingObject.getValue());
        return commandContext.respondToCommand("The default timer is " + defaultTimer.printTimeLeft + ".");
    };
    this.printTimeLeftShort = function () {
        var lastKnownTimeLeft = new Timer(_lastKnownMsLeftForNewTurn);
        return commandContext.respondToCommand(lastKnownTimeLeft.printTimeLeftShort());
    };
}
function isNewTurn(lastKnownTurnNumber, updatedTurnNumber) {
    return lastKnownTurnNumber < updatedTurnNumber;
}
function isLastHour(lastKnownMsLeft, updatedMsLeft) {
    return lastKnownMsLeft > 3600000 && updatedMsLeft <= 3600000;
}
function anHourWentBy(lastKnownMsLeft, updatedMsLeft) {
    return Math.floor(lastKnownMsLeft / 3600000) > Math.floor(updatedMsLeft / 3600000);
}
//# sourceMappingURL=dominions5_current_timer.js.map