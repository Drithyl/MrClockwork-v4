
const TimeLeft = require("../../../games/prototypes/time_left.js");
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

        return `${_value.days}d${_value.hours}h${_value.minutes}m`;
    };
    
    this.setValue = (input) =>
    {
        const validatedValue = _validateInputFormatOrThrow(input);

        _value = validatedValue;
    };

    this.fromJSON = (msLeft) =>
    {
        const timeLeft = new TimeLeft(0);

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
    
        return [`--hours`,  hoursLeft, `--minutes`, minutesLeft];
    };

    function _validateInputFormatOrThrow(input)
    {
        const timeLeft = TimeLeft.fromStringInput(input);

        return timeLeft;
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the TimerSetting constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
TimerSetting.prototype = new GameSetting(key);
TimerSetting.prototype.constructor = TimerSetting;

TimerSetting.prototype.getPrompt = () => TimerSetting.prototype.getDescription();
