
const GameSetting = require("../../prototypes/game_setting.js");
const dom6SettingsData = require("../../../json/dom6_settings.json");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "eventRarity";

module.exports = EventRarity;

function EventRarity()
{
    var _value;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        var value = this.getValue();

        if (value == 1)
            return "Common";

        if (value === 2)
            return "Rare";

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
    
        return [`--eventrarity`, value];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (EventRarity.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for the event rarity.`);

        if (+input == 1 || +input == 2)
            return +input;

        else throw new SemanticError(`Unexpected value for the event rarity: ${input}`);
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the EventRarity constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
EventRarity.prototype = new GameSetting(key, dom6SettingsData[key]);
EventRarity.prototype.constructor = EventRarity;
