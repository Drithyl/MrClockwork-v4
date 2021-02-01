
const GameSetting = require("../../prototypes/game_setting.js");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "suppliesModifier";

module.exports = SuppliesModifier;

function SuppliesModifier()
{
    var _value;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        var value = this.getValue();

        return `${value}%`;
    };
    
    this.setValue = (input) =>
    {
        const validatedValue = _validateInputFormatOrThrow(input);

        _value = validatedValue;
    };

    this.fromJSON = (value) =>
    {
        if (Number.isInteger(value) === false)
            throw new Error(`Expected integer; got ${value}`);

        _value = value;
    };

    this.translateValueToCmdFlag = () =>
    {
        var value = this.getValue();
    
        return [`--supplies`, value];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (SuppliesModifier.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for the supplies modifier.`);

        return +input.replace(/\D*/, "");
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the SuppliesModifier constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
SuppliesModifier.prototype = new GameSetting(key);
SuppliesModifier.prototype.constructor = SuppliesModifier;
