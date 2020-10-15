"use strict";
var assert = require("./asserter.js");
var SemanticError = require("./errors/custom_errors.js").SemanticError;
var MS_IN_A_SECOND = 1000;
var MS_IN_A_MINUTE = 60000;
var MS_IN_AN_HOUR = 3600000;
var MS_IN_A_DAY = 86400000;
var daysLeftRegExp = /\d+d(ay)?s?/i;
var hoursLeftRegExp = /\d+h(our)?s?/i;
var minutesLeftRegExp = /\d+m(inute)?s?/i;
var secondsLeftRegExp = /\d+s(econd)?s?/i;
module.exports = Timer;
function Timer(ms) {
    var _this = this;
    assert.isIntegerOrThrow(ms);
    var _ms = ms;
    var _days;
    var _hours;
    var _minutes;
    var _seconds;
    _update(_ms);
    this.update = _update;
    this.getDaysLeft = function () { return _days; };
    this.getHoursLeft = function () { return _hours; };
    this.getMinutesLeft = function () { return _minutes; };
    this.getSecondsLeft = function () { return _seconds; };
    this.getMsLeft = function () { return _ms; };
    this.printTimeLeft = function () {
        var str = "";
        var days = _this.getDaysLeft();
        var hours = _this.getHoursLeft();
        var minutes = _this.getMinutesLeft();
        var seconds = _this.getSecondsLeft();
        if (_isPaused)
            return "Paused.";
        if (days > 0)
            str += days + " day(s), ";
        if (hours > 0)
            str += hours + " hour(s), ";
        if (minutes > 0)
            str += minutes + " minute(s), ";
        if (seconds > 0)
            str += seconds + " second(s) ";
        return str;
    };
    this.printTimeLeftShort = function () {
        var str = "";
        var days = _this.getDaysLeft();
        var hours = _this.getHoursLeft();
        var minutes = _this.getMinutesLeft();
        var seconds = _this.getSecondsLeft();
        if (_isPaused)
            return "Paused";
        str += (days < 10) ? "0" + days : days;
        str += (hours < 10) ? ":0" + hours : ":" + hours;
        str += (minutes < 10) ? ":0" + minutes : ":" + minutes;
        str += (seconds < 10) ? ":0" + seconds : ":" + seconds;
        return str;
    };
    function _update(msLeftNow) {
        _ms = msLeftNow;
        _days = msToDays(msLeftNow);
        msLeftNow -= _days * MS_IN_A_DAY;
        _hours = msToHours(msLeftNow);
        msLeftNow -= _hours * MS_IN_AN_HOUR;
        _minutes = msToMinutes(msLeftNow);
        msLeftNow -= _minutes * MS_IN_A_MINUTE;
        _seconds = msToSeconds(msLeftNow);
    }
}
Timer.parseTimeLeftToMs = function (timeLeftAsString) {
    assert.isStringOrThrow(timeLeftAsString);
    //treat straight numbers as hours
    if (assert.isInteger(+timeLeftAsString) === true)
        return +timeLeftAsString * MS_IN_AN_HOUR;
    else if (isStringInRightFormat(timeLeftAsString) === false)
        throw new SemanticError("Invalid time format.");
    var daysMatch = input.match(daysLeftRegExp);
    var hoursMatch = input.match(hoursLeftRegExp);
    var minutesMatch = input.match(minutesLeftRegExp);
    var secondsMatch = input.match(secondsLeftRegExp);
    var days = extractNumberFromMatch(daysMatch);
    var hours = extractNumberFromMatch(hoursMatch);
    var minutes = extractNumberFromMatch(minutesMatch);
    var seconds = extractNumberFromMatch(secondsMatch);
    var totalMs = (days * MS_IN_A_DAY) + (hours * MS_IN_AN_HOUR) + (minutes * MS_IN_A_MINUTE) + (seconds * MS_IN_A_SECOND);
    return totalMs;
};
function msToSeconds(ms) {
    return Math.floor(ms / MS_IN_A_SECOND);
}
function msToMinutes(ms) {
    return Math.floor(ms / MS_IN_A_MINUTE);
}
function msToHours(ms) {
    return Math.floor(ms / MS_IN_AN_HOUR);
}
function msToDays(ms) {
    return Math.floor(ms / MS_IN_A_DAY);
}
function isStringInRightFormat(timeLeftAsString) {
    return daysLeftRegExp.test(timeLeftAsString) || hoursLeftRegExp.test(timeLeftAsString) || minutesLeftRegExp.test(timeLeftAsString) || secondsLeftRegExp(timeLeftAsString);
}
function extractNumberFromMatch(stringMatchResult) {
    (stringMatchResult != null) ? +stringMatchResult[0].replace(/\D/g, "") : 0;
}
//# sourceMappingURL=time_left_prototype.js.map