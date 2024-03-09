
const assert = require("../../../asserter.js");
const GameSetting = require("../../prototypes/game_setting.js");
const dom5SettingsData = require("../../../json/dom5_settings.json");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "independentsStrength";

module.exports = IndependentsStrength;

function IndependentsStrength()
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
    
        return [`--indepstr`, value];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (IndependentsStrength.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for independents' strength.`);

        if (assert.isInteger(+input) === true && +input >= 0 && +input <= 9)
            return +input;

        else throw new SemanticError(`Unexpected value for the independents' strength: ${input}`);
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the IndependentsStrength constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
IndependentsStrength.prototype = new GameSetting(key, dom5SettingsData[key]);
IndependentsStrength.prototype.constructor = IndependentsStrength;
