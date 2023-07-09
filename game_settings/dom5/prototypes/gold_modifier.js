
const assert = require("../../../asserter.js");
const GameSetting = require("../../prototypes/game_setting.js");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "goldModifier";

module.exports = GoldModifier;

function GoldModifier()
{
    let _value;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        return `${_value}%`;
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
    
        return [`--richness`, value];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (GoldModifier.prototype.isExpectedFormat(input) === input)
            throw new SemanticError(`Invalid value format for the gold modifier.`);

        if (assert.isInteger(+input) === true && +input >= 50 && +input <= 300)
            return +input;

        else throw new SemanticError(`Unexpected value for the gold modifier: ${input}`);
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the GoldModifier constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
GoldModifier.prototype = new GameSetting(key);
GoldModifier.prototype.constructor = GoldModifier;
