
const assert = require("../../../asserter.js");
const GameSetting = require("../../prototypes/game_setting.js");
const dom6SettingsData = require("../../../json/dom6_settings.json");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "startingProvinces";

module.exports = StartingProvinces;

function StartingProvinces()
{
    var _value;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        var value = this.getValue();

        return value;
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
    
        return [`--startprov`, value];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (StartingProvinces.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for the starting provinces.`);

        if (assert.isInteger(+input) === true && +input >= 1 && +input <= 9)
            return +input;

        else throw new SemanticError(`Unexpected value for the starting provinces: ${input}`);
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the StartingProvinces constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
StartingProvinces.prototype = new GameSetting(key, dom6SettingsData[key]);
StartingProvinces.prototype.constructor = StartingProvinces;
