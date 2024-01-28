
const GameSetting = require("../../prototypes/game_setting.js");
const dom6SettingsData = require("../../../json/dom6_settings.json");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "era";

module.exports = Era;

function Era()
{
    var _value;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        var value = this.getValue();

        if (value == 1)
            return "Early Age";

        if (value === 2)
            return "Middle Age";
        
        if (value === 3)
            return "Late Age";

        else return "invalid value";
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
    
        return [`--era`, value];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (Era.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for era.`);

        if (+input == 1 || +input == 2 || +input == 3)
            return +input;

        else throw new SemanticError(`Unexpected value for the era: ${input}`);
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Era constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Era.prototype = new GameSetting(key, dom6SettingsData[key]);
Era.prototype.constructor = Era;
