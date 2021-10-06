
const GameSetting = require("../../prototypes/game_setting.js");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "ascensionPoints";

module.exports = AscensionPoints;

function AscensionPoints()
{
    var _value;

    this.getValue = () => _value;
    this.getReadableValue = () => _value;
    
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
    
        return [`--requiredap`, value];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (AscensionPoints.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for ascension points.`);

        return +input.replace(/\D*/, "");
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the AscensionPoints constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
AscensionPoints.prototype = new GameSetting(key);
AscensionPoints.prototype.constructor = AscensionPoints;
