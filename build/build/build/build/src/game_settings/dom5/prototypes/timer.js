"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "timer";
module.exports = TimerSetting;
function TimerSetting() {
    var _this = this;
    var _value;
    this.getValue = function () { return _value; };
    this.getReadableValue = function () {
        if (_value == null || _value == 0)
            return "No timer/Paused";
        return _value.days + "d" + _value.hours + "h" + _value.minutes + "m";
    };
    this.setValue = function (input) {
        var validatedValue = _validateInputFormatOrThrow(input);
        _value = validatedValue;
    };
    function _validateInputFormatOrThrow(input) {
        var timer = {};
        if (TimerSetting.prototype.isExpectedFormat(input) === false)
            throw new SemanticError("Invalid value format for timer. Make sure the hours are less than 24 and that minutes are less than 60.");
        if (/^\d+$/.test(input) === true)
            return +input;
        _matchAndAssign(timer, input, /(\d+)\s*d/i, "days");
        _matchAndAssign(timer, input, /(\d+)\s*h/i, "hours");
        _matchAndAssign(timer, input, /(\d+)\s*m/i, "minutes");
        return timer;
    }
    ;
    this.fromJSON = function (value) {
        if (typeof value !== "object")
            throw new Error("Expected object; got " + value);
        for (var timeframe in value) {
            var numberOfTime = value[timeframe];
            if (typeof timeframe !== "string")
                throw new Error("Expected string; got " + timeframe);
            if (Number.isInteger(numberOfTime) === false)
                throw new Error("Expected integer; got " + numberOfTime);
            if (numberOfTime < 0)
                value[timeframe] = 0;
        }
        _value = value;
    };
    this.translateValueToCmdFlag = function () {
        var value = _this.getValue();
        var hours = (value.days * 24) + value.hours;
        var minutes = value.minutes;
        if (value == null || value == 0)
            return [];
        if (hours + minutes <= 0)
            return [];
        return ["--hours", (value.days * 24) + value.hours, "--minutes", value.minutes];
    };
    function _matchAndAssign(object, input, matchRegexp, key) {
        var match = input.match(matchRegexp);
        if (match == null)
            object[key] = 0;
        else
            object[key] = +match[0].replace(/[^\d+]/g, "");
    }
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the TimerSetting constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
TimerSetting.prototype = new GameSetting(key);
TimerSetting.prototype.constructor = TimerSetting;
TimerSetting.prototype.getPrompt = function () { return TimerSetting.prototype.getDescription(); };
//# sourceMappingURL=timer.js.map