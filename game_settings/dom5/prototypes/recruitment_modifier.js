
const assert = require("../../../asserter.js");
const GameSetting = require("../../prototypes/game_setting.js");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "recruitmentModifier";

module.exports = RecruitmentModifier;

function RecruitmentModifier()
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
    
        return [`--recruitment`, value];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (RecruitmentModifier.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for the recruitment modifier.`);

        if (assert.isInteger(+input) === true && +input >= 50 && +input <= 300)
            return +input;

        else throw new SemanticError(`Unexpected value for the recruitment modifier: ${input}`);
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the RecruitmentModifier constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
RecruitmentModifier.prototype = new GameSetting(key);
RecruitmentModifier.prototype.constructor = RecruitmentModifier;
