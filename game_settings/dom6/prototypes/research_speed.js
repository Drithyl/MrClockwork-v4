
const assert = require("../../../asserter.js");
const GameSetting = require("../../prototypes/game_setting.js");
const dom6SettingsData = require("../../../json/dom6_settings.json");
const dom6SettingFlags = require("../../../json/dominions6_setting_flags.json");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "researchSpeed";

module.exports = ResearchSpeed;

function ResearchSpeed()
{
    var _value;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        var value = this.getValue();

        if (value == dom6SettingFlags.VERY_EASY_RESEARCH_SPEED)
            return "Very Easy";

        if (value == dom6SettingFlags.EASY_RESEARCH_SPEED)
            return "Easy";

        if (value == dom6SettingFlags.HARD_RESEARCH_SPEED)
            return "Hard";

        if (value == dom6SettingFlags.VERY_HARD_RESEARCH_SPEED)
            return "Very Hard";

        //default value
        else return "Normal";
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
        var value = this.getValue();
    
        return [`--research`, value];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (ResearchSpeed.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for the research speed.`);

        if (assert.isInteger(+input) === true && +input >= dom6SettingFlags.VERY_EASY_RESEARCH_SPEED && +input <= dom6SettingFlags.VERY_HARD_RESEARCH_SPEED)
            return +input;

        else throw new SemanticError(`Unexpected value for the research speed: ${input}`);
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the ResearchSpeed constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
ResearchSpeed.prototype = new GameSetting(key, dom6SettingsData[key]);
ResearchSpeed.prototype.constructor = ResearchSpeed;
