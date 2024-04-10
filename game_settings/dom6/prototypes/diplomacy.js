
const assert = require("../../../asserter.js");
const GameSetting = require("../../prototypes/game_setting.js");
const dom6SettingsData = require("../../../json/dom6_settings.json");
const dom6SettingFlags = require("../../../json/dominions6_setting_flags.json");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "diplomacy";

module.exports = Diplomacy;

function Diplomacy()
{
    var _value;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        var value = this.getValue();

        if (value == dom6SettingFlags.DISABLED_DIPLOMACY)
            return "Disabled";

        if (value == dom6SettingFlags.NON_BINDING_DIPLOMACY)
            return "Non-binding";
        
        if (value == dom6SettingFlags.BINDING_DIPLOMACY)
            return "Binding";

        else return "Invalid value";
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

        if (value == dom6SettingFlags.DISABLED_DIPLOMACY)
            return ["--nodiplo"];
    
        else if (value == dom6SettingFlags.BINDING_DIPLOMACY)
            return [];

        // Make non-binding diplomacy the default
        else return [`--weakdiplo`];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (Diplomacy.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for diplomacy.`);

        if (assert.isInteger(+input) === true && +input >= dom6SettingFlags.DISABLED_DIPLOMACY && +input <= dom6SettingFlags.BINDING_DIPLOMACY)
            return +input;

        else throw new SemanticError(`Unexpected value for diplomacy: ${input}`);
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Diplomacy constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Diplomacy.prototype = new GameSetting(key, dom6SettingsData[key]);
Diplomacy.prototype.constructor = Diplomacy;
