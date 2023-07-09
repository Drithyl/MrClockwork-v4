
const assert = require("../../../asserter.js");
const GameSetting = require("../../prototypes/game_setting.js");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "magicSites";

module.exports = MagicSites;

function MagicSites()
{
    let _value;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        let value = this.getValue();

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
        let value = this.getValue();
    
        return [`--magicsites`, value];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (MagicSites.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for magic sites.`);

        if (assert.isInteger(+input) === true && +input >= 0 && +input <= 75)
            return +input;

        else throw new SemanticError(`Unexpected value for the magic sites: ${input}`);
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the MagicSites constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
MagicSites.prototype = new GameSetting(key);
MagicSites.prototype.constructor = MagicSites;
