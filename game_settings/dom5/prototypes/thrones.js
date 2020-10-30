
const GameSetting = require("../../prototypes/game_setting.js");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "thrones";

module.exports = Thrones;

function Thrones()
{
    var _value;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        return `${_value[0]} Level One, ${_value[1]} Level Two, ${_value[2]} Level Three`;
    };
    
    this.setValue = (input) =>
    {
        const validatedValue = _validateInputFormatOrThrow(input);

        _value = validatedValue;
    };

    this.fromJSON = (value) =>
    {
        if (Array.isArray(value) === false)
            throw new Error(`Expected array of integers; got ${value}`);

        value.forEach((throneNbr) =>
        {
            if (Number.isInteger(throneNbr) === false)
                throw new Error(`Expected integer; got ${throneNbr}`);
        });

        _value = value;
    };

    this.translateValueToCmdFlag = () =>
    {
        var value = this.getValue();
    
        return [`--thrones`, ...value];
    };

    function _validateInputFormatOrThrow(input)
    {
        var thrones = [];

        if (Thrones.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for thrones.`);

        input.split(",").forEach((throneLevel) =>
        {
            thrones.push(+throneLevel.replace(/\D*/g, ""));
        });

        return thrones;
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Thrones constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Thrones.prototype = new GameSetting(key);
Thrones.prototype.constructor = Thrones;

Thrones.prototype.getPrompt = () => Thrones.prototype.getDescription();
