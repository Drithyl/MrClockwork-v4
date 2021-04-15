
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

  let _ms = ms;
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

  this.printTimeLeft = () =>
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

    if (seconds > 0)
      str += seconds + " second(s) ";

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

  var daysMatch = timeLeftAsString.match(daysLeftRegExp);
  var hoursMatch = timeLeftAsString.match(hoursLeftRegExp);
  var minutesMatch = timeLeftAsString.match(minutesLeftRegExp);
  var secondsMatch = timeLeftAsString.match(secondsLeftRegExp);

  var days = _extractNumberFromMatch(daysMatch);
  var hours = _extractNumberFromMatch(hoursMatch);
  var minutes = _extractNumberFromMatch(minutesMatch);
  var seconds = _extractNumberFromMatch(secondsMatch);
  var totalMs = (days * MS_IN_A_DAY) + (hours * MS_IN_AN_HOUR) + (minutes * MS_IN_A_MINUTE) + (seconds * MS_IN_A_SECOND);
  
  return new TimeLeft(totalMs);
};

function _msToSeconds(ms)
{
  return Math.floor(ms/MS_IN_A_SECOND);
}

function _msToMinutes(ms)
{
  return Math.floor(ms/MS_IN_A_MINUTE);
}

function _msToHours(ms)
{
  return Math.floor(ms/MS_IN_AN_HOUR);
}

function _msToDays(ms)
{
  return Math.floor(ms/MS_IN_A_DAY);
}

function _isStringInRightFormat(timeLeftAsString)
{
  return daysLeftRegExp.test(timeLeftAsString) || hoursLeftRegExp.test(timeLeftAsString) || minutesLeftRegExp.test(timeLeftAsString) || secondsLeftRegExp(timeLeftAsString);
}

function _extractNumberFromMatch(stringMatchResult)
{
  return (stringMatchResult != null) ? +stringMatchResult[0].replace(/\D/g, "") : 0;
}