
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

  this.printTimeLeftShort = () =>
  {
    let str = "";
    let days = this.getDaysLeft();
    let hours = this.getHoursLeft();
    let minutes = this.getMinutesLeft();
    let seconds = this.getSecondsLeft();

    if (_isPaused)
      return "Paused";

    str += (days < 10) ? `0${days}` : days;
    str += (hours < 10) ? `:0${hours}` : `:${hours}`;
    str += (minutes < 10) ? `:0${minutes}` : `:${minutes}`;
    str += (seconds < 10) ? `:0${seconds}` : `:${seconds}`;
    return str;
  };

  function _update(msLeftNow)
  {
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

TimeLeft.parseTimeLeftToMs = (timeLeftAsString) =>
{
  assert.isStringOrThrow(timeLeftAsString);

  //treat straight numbers as hours
  if (assert.isInteger(+timeLeftAsString) === true)
    return +timeLeftAsString * MS_IN_AN_HOUR;

  else if (isStringInRightFormat(timeLeftAsString) === false)
    throw new SemanticError(`Invalid time format.`);

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

function msToSeconds(ms)
{
  return Math.floor(ms/MS_IN_A_SECOND);
}

function msToMinutes(ms)
{
  return Math.floor(ms/MS_IN_A_MINUTE);
}

function msToHours(ms)
{
  return Math.floor(ms/MS_IN_AN_HOUR);
}

function msToDays(ms)
{
  return Math.floor(ms/MS_IN_A_DAY);
}

function isStringInRightFormat(timeLeftAsString)
{
  return daysLeftRegExp.test(timeLeftAsString) || hoursLeftRegExp.test(timeLeftAsString) || minutesLeftRegExp.test(timeLeftAsString) || secondsLeftRegExp(timeLeftAsString);
}

function extractNumberFromMatch(stringMatchResult)
{
  (stringMatchResult != null) ? +stringMatchResult[0].replace(/\D/g, "") : 0;
}