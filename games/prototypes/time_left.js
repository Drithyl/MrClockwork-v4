
const assert = require("../../asserter.js");
const SemanticError = require("../../errors/custom_errors.js").SemanticError;

const MS_IN_A_SECOND = 1000;
const MS_IN_A_MINUTE = 60000;
const MS_IN_AN_HOUR = 3600000;
const MS_IN_A_DAY = 86400000;
const daysLeftRegExp = /\d+d(ay)?s?/i;
const hoursLeftRegExp = /\d+h(our)?s?/i;
const minutesLeftRegExp = /\d+m(inute)?s?/i;
const secondsLeftRegExp = /\d+s(econd)?s?/i;

module.exports = TimeLeft;

function TimeLeft(ms)
{
    assert.isIntegerOrThrow(ms);

    let _ms = (ms > 0) ? ms : 0;
    let _days;
    let _hours;
    let _minutes;
    let _seconds;

    _update(_ms);

    this.update = _update;
    this.getDaysLeft = () => _days;
    this.getHoursLeft = () => _hours;
    this.getMinutesLeft = () => _minutes;
    this.getSecondsLeft = () => _seconds;
    this.getMsLeft = () => _ms;

    this.printTimeLeft = (ignoreSeconds = false) =>
    {
        let str = "";
        let days = this.getDaysLeft();
        let hours = this.getHoursLeft();
        let minutes = this.getMinutesLeft();
        let seconds = this.getSecondsLeft();

        if (days > 0)
            str += days + " day(s), ";

        if (hours > 0)
            str += hours + " hour(s), ";

        if (minutes > 0)
            str += minutes + " minute(s), ";

        if (seconds > 0 && ignoreSeconds === false)
            str += seconds + " second(s) ";

        if (/\S/.test(str) === false)
            return "none";

        if (/, $/i.test(str) === true)
            return str.replace(/, $/i, "");

        return str.trim();
    };

  this.printTimeLeftShort = () =>
  {
    let str = "";
    let days = this.getDaysLeft();
    let hours = this.getHoursLeft();
    let minutes = this.getMinutesLeft();
    let seconds = this.getSecondsLeft();

    str += (days < 10) ? `0${days}` : days;
    str += (hours < 10) ? `:0${hours}` : `:${hours}`;
    str += (minutes < 10) ? `:0${minutes}` : `:${minutes}`;
    str += (seconds < 10) ? `:0${seconds}` : `:${seconds}`;
    return str;
  };

  this.toDateObject = () =>
  {
    const now = new Date();
    const msWhenTurnWillRoll = now.getTime() + _ms;
    return new Date(msWhenTurnWillRoll);
  };

    this.toJSON = () => this.getMsLeft();

    function _update(msLeftNow)
    {
        _ms = msLeftNow;

        _days = _msToDays(msLeftNow);
        msLeftNow -= _days * MS_IN_A_DAY;

        _hours = _msToHours(msLeftNow);
        msLeftNow -= _hours * MS_IN_AN_HOUR;

        _minutes = _msToMinutes(msLeftNow);
        msLeftNow -= _minutes * MS_IN_A_MINUTE;

        _seconds = _msToSeconds(msLeftNow);
    }
}

TimeLeft.fromStringInput = (timeLeftAsString) =>
{
    assert.isStringOrThrow(timeLeftAsString);

    //treat straight numbers as hours
    if (assert.isInteger(+timeLeftAsString) === true)
        return new TimeLeft(+timeLeftAsString * MS_IN_AN_HOUR);

    else if (_isStringInRightFormat(timeLeftAsString) === false)
        throw new SemanticError(`Invalid time format.`);

    let daysMatch = timeLeftAsString.match(daysLeftRegExp);
    let hoursMatch = timeLeftAsString.match(hoursLeftRegExp);
    let minutesMatch = timeLeftAsString.match(minutesLeftRegExp);
    let secondsMatch = timeLeftAsString.match(secondsLeftRegExp);

    let days = _extractNumberFromMatch(daysMatch);
    let hours = _extractNumberFromMatch(hoursMatch);
    let minutes = _extractNumberFromMatch(minutesMatch);
    let seconds = _extractNumberFromMatch(secondsMatch);
    let totalMs = (days * MS_IN_A_DAY) + (hours * MS_IN_AN_HOUR) + (minutes * MS_IN_A_MINUTE) + (seconds * MS_IN_A_SECOND);

    return new TimeLeft(totalMs);
};

TimeLeft.msToSeconds = _msToSeconds;
TimeLeft.secondsToMs = _secondsToMs;

TimeLeft.msToMinutes = _msToMinutes;
TimeLeft.minutesToMs = _minutesToMs;

TimeLeft.msToHours = _msToHours;
TimeLeft.hoursToMs = _hoursToMs;

TimeLeft.msToDays = _msToDays;
TimeLeft.daysToMs = _daysToMs;

function _msToSeconds(ms)
{
    return Math.floor(ms/MS_IN_A_SECOND);
}

function _secondsToMs(seconds)
{
    return Math.floor(seconds*MS_IN_A_SECOND);
}

function _msToMinutes(ms)
{
    return Math.floor(ms/MS_IN_A_MINUTE);
}

function _minutesToMs(minutes)
{
    return Math.floor(minutes*MS_IN_A_MINUTE);
}

function _msToHours(ms)
{
    return Math.floor(ms/MS_IN_AN_HOUR);
}

function _hoursToMs(hours)
{
    return Math.floor(hours*MS_IN_AN_HOUR);
}

function _msToDays(ms)
{
    return Math.floor(ms/MS_IN_A_DAY);
}

function _daysToMs(days)
{
    return Math.floor(days*MS_IN_A_DAY);
}

function _isStringInRightFormat(timeLeftAsString)
{
    return daysLeftRegExp.test(timeLeftAsString) || hoursLeftRegExp.test(timeLeftAsString) || minutesLeftRegExp.test(timeLeftAsString) || secondsLeftRegExp.test(timeLeftAsString);
}

function _extractNumberFromMatch(stringMatchResult)
{
    return (stringMatchResult != null) ? +stringMatchResult[0].replace(/\D/g, "") : 0;
}