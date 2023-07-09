
const assert = require("../../../asserter.js");
const GameSetting = require("../../prototypes/game_setting.js");
const dom5SettingFlags = require("../../../json/dominions5_setting_flags.json");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "scoregraphs";

module.exports = Scoregraphs;

function Scoregraphs()
{
    let _value;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        let value = this.getValue();

        if (value == dom5SettingFlags.NO_SCOREGRAPHS)
            return "Completely disabled";

        if (value == dom5SettingFlags.INVISIBLE_SCOREGRAPHS)
            return "Visible through sites/magic";
        
        if (value == dom5SettingFlags.VISIBLE_SCOREGRAPHS)
            return "Always visible";

        else return "Invalid value";
    };
    
    this.setValue = (input) =>
    {
        const validatedValue = _validateInputFormatOrThrow(input);

        _value = validatedValue;
    };

    this.fromJSON = (value) =>
    {
        if (Number.isInteger(+value) === false)
            throw new Error(`Expected integer; got ${+value}`);

        _value = +value;
    };

    this.translateValueToCmdFlag = () =>
    {
        let value = this.getValue();

        if (value == dom5SettingFlags.NO_SCOREGRAPHS)
            return ["--nonationinfo"];
    
        else if (value == dom5SettingFlags.VISIBLE_SCOREGRAPHS)
            return [`--scoregraphs`];

        else return [];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (Scoregraphs.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for the scoregraphs.`);

        if (assert.isInteger(+input) === true && +input >= dom5SettingFlags.NO_SCOREGRAPHS && +input <= dom5SettingFlags.VISIBLE_SCOREGRAPHS)
            return +input;

        else throw new SemanticError(`Unexpected value for the scoregraphs: ${input}`);
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Scoregraphs constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Scoregraphs.prototype = new GameSetting(key);
Scoregraphs.prototype.constructor = Scoregraphs;
