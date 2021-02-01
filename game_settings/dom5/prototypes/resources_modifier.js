
const GameSetting = require("../../prototypes/game_setting.js");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "resourcesModifier";

module.exports = ResourcesModifier;

function ResourcesModifier()
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
    
        return [`--resources`, value];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (ResourcesModifier.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for the resources modifier.`);

        return +input.replace(/\D*/, "");
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the ResourcesModifier constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
ResourcesModifier.prototype = new GameSetting(key);
ResourcesModifier.prototype.constructor = ResourcesModifier;
