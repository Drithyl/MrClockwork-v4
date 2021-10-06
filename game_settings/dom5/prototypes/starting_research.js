
const GameSetting = require("../../prototypes/game_setting.js");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "startingResearch";

module.exports = StartingResearch;

function StartingResearch()
{
    var _value;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        var value = this.getValue();

        if (value == true)
            return "Spread starting research";

        else return "Random starting research";
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
            throw new Error(`Expected boolean; got ${value}`);

        _value = value;
    };

    this.translateValueToCmdFlag = () =>
    {
        var value = this.getValue();
    
        if (value == true)
            return [`--norandres`];
    
        else return [];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (StartingResearch.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for the starting research.`);

        if (+input == 0)
            return false;

        else if (+input == 1)
            return true;

        else throw new SemanticError(`Unexpected value for the starting research: ${input}`);
    }

    function _patchFromV3(value)
    {
        if (+value === 0)
            return false;

        else return true;
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the StartingResearch constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
StartingResearch.prototype = new GameSetting(key);
StartingResearch.prototype.constructor = StartingResearch;
