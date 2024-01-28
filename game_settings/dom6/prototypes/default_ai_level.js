
const assert = require("../../../asserter.js");
const GameSetting = require("../../prototypes/game_setting.js");
const dom6SettingsData = require("../../../json/dom6_settings.json");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;
const dom6SettingFlags = require("../../../json/dominions6_setting_flags.json");

const key = "defaultAiLevel";

module.exports = DefaultAiLevel;

function DefaultAiLevel()
{
    var _value;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        var value = this.getValue();

        if (value === dom6SettingFlags.NO_GOING_AI)
            return "No going AI";

        if (value === dom6SettingFlags.EASY_PLAYER_AI)
            return dom6SettingFlags.EASY_AI;
        
        if (value === dom6SettingFlags.NORMAL_PLAYER_AI)
            return dom6SettingFlags.NORMAL_AI;

        if (value === dom6SettingFlags.DIFFICULT_PLAYER_AI)
            return dom6SettingFlags.DIFFICULT_AI;

        if (value === dom6SettingFlags.MIGHTY_PLAYER_AI)
            return dom6SettingFlags.MIGHTY_AI;

        if (value === dom6SettingFlags.MASTER_PLAYER_AI)
            return dom6SettingFlags.MASTER_AI;

        if (value === dom6SettingFlags.IMPOSSIBLE_PLAYER_AI)
            return dom6SettingFlags.IMPOSSIBLE_AI;

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
        var value = this.getValue();
    
        if (value == 0)
            return ["--nonewai"];
    
        if (value >= 1 && value <= 6)
            return [`--newailvl`, value];
    
        else return [];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (DefaultAiLevel.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for the default AI level.`);

        if (assert.isInteger(+input) === true && +input >= dom6SettingFlags.NO_GOING_AI && +input <= dom6SettingFlags.IMPOSSIBLE_PLAYER_AI)
            return +input;

        else throw new SemanticError(`Unexpected value for the default ai level: ${input}`);
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the DefaultAiLevel constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
DefaultAiLevel.prototype = new GameSetting(key, dom6SettingsData[key]);
DefaultAiLevel.prototype.constructor = DefaultAiLevel;
