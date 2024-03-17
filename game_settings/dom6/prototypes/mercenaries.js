
const assert = require("../../../asserter.js");
const GameSetting = require("../../prototypes/game_setting.js");
const dom6SettingsData = require("../../../json/dom6_settings.json");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "mercenaries";

module.exports = Mercenaries;

function Mercenaries()
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
    
        return [`--mercsize`, value];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (Mercenaries.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for the maximum number of mercenaries.`);

        if (assert.isInteger(+input) === true && +input >= 0 && +input <= 10)
            return +input;

        else throw new SemanticError(`Unexpected value for the the maximum number of mercenaries: ${input}`);
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Mercenaries constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Mercenaries.prototype = new GameSetting(key, dom6SettingsData[key]);
Mercenaries.prototype.constructor = Mercenaries;
