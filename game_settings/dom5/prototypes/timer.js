
const TimeLeft = require("../../../games/prototypes/time_left.js");
const dom5SettingsData = require("../../../json/dom5_settings.json");
const GameSetting = require("../../prototypes/game_setting.js");

const key = "timer";

module.exports = TimerSetting;

function TimerSetting()
{
    var _value;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        if (_value == null || _value == 0)
            return "No timer/Paused";

        return `${_value.getDaysLeft()}d${_value.getHoursLeft()}h${_value.getMinutesLeft()}m`;
    };
    
    this.setValue = (input) =>
    {
        const validatedValue = _validateInputFormatOrThrow(input);

        _value = validatedValue;
    };

    this.fromJSON = (msLeft, needsPatching = false) =>
    {
        const timeLeft = new TimeLeft(0);

        if (needsPatching === true)
            msLeft = _patchFromV3(msLeft);
            
        if (isNaN(+msLeft) === true)
            throw new Error(`Expected number; got ${msLeft}`);

        timeLeft.update(+msLeft);

        _value = timeLeft;
    };

    this.translateValueToCmdFlag = () =>
    {
        const timeLeft = this.getValue();
        const hoursLeft = timeLeft.getDaysLeft() * 24 + timeLeft.getHoursLeft();
        const minutesLeft = timeLeft.getMinutesLeft();
    
        if (timeLeft == null || timeLeft == 0)
            return [];
    
        if (hoursLeft + minutesLeft <= 0)
            return [];
    
        return [`--hours`, hoursLeft, `--minutes`, minutesLeft];
    };

    function _validateInputFormatOrThrow(input)
    {
        const timeLeft = TimeLeft.fromStringInput(input);

        return timeLeft;
    }

    function _patchFromV3(v3TimerObj)
    {
        var timerInMs = 0;

        if (Number.isInteger(+v3TimerObj.days) === true)
            timerInMs += +v3TimerObj.days * 24 * 3600 * 1000;
            
        if (Number.isInteger(+v3TimerObj.hours) === true)
            timerInMs += +v3TimerObj.hours * 3600 * 1000;

        if (Number.isInteger(+v3TimerObj.minutes) === true)
            timerInMs += +v3TimerObj.minutes * 60 * 1000;

        if (timerInMs <= 0)
            return 115200000;  // 32h as default timer if above conversion fails

        else return timerInMs;
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the TimerSetting constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
TimerSetting.prototype = new GameSetting(key, dom5SettingsData[key]);
TimerSetting.prototype.constructor = TimerSetting;
