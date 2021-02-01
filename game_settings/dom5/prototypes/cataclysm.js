
const GameSetting = require("../../prototypes/game_setting.js");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "cataclysm";

module.exports = Cataclysm;

function Cataclysm()
{
    var _value;

    this.getValue = () => _value;
    this.getReadableValue = () => `Turn ${_value}`;
    
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
    
        if (value > 0)
            return [`--cataclysm`, value];
    
        else return [];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (Cataclysm.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for cataclysm.`);

        return +input.replace(/\D*/g, "");
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Cataclysm constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Cataclysm.prototype = new GameSetting(key);
Cataclysm.prototype.constructor = Cataclysm;

Cataclysm.prototype.getPrompt = () => Cataclysm.prototype.getDescription();
