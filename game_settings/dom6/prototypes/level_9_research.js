
const GameSetting = require("../../prototypes/game_setting.js");
const dom6SettingsData = require("../../../json/dom6_settings.json");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "level9Research";

module.exports = Level9Research;

function Level9Research()
{
    var _value;

    this.getValue = () => _value;
    this.getReadableValue = () => 
    {
        if (this.getValue() === true)
            return "Level 9 spells are researched normally";

        else return "Level 9 spells are researched individually";
    };
    
    this.setValue = (input) =>
    {
        const validatedValue = _validateInputFormatOrThrow(input);

        _value = validatedValue;
    };

    this.fromJSON = (value, needsPatching = false) =>
    {
        if (needsPatching === true)
            value = _patchFromV3(value);
            
        if (typeof value !== "boolean")
            throw new Error(`level9Research expected boolean; got ${value}`);

        _value = value;
    };

    this.translateValueToCmdFlag = () =>
    {
        var value = this.getValue();
    
        if (value === true)
            return ["--nolvl9rest"];
    
        else return [];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (Level9Research.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for artifact forging.`);

        if (+input == 0)
            return false;

        else if (+input == 1)
            return true;

        else throw new SemanticError(`Unexpected value for the artifact forging: ${input}`);
    }

    function _patchFromV3(value)
    {
        if (+value == 1)
            return true;
        
        else return false;
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Level9Research constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Level9Research.prototype = new GameSetting(key, dom6SettingsData[key]);
Level9Research.prototype.constructor = Level9Research;
