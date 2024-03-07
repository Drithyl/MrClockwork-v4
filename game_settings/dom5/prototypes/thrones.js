
const GameSetting = require("../../prototypes/game_setting.js");
const dom5SettingsData = require("../../../json/dom5_settings.json");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "thrones";

module.exports = Thrones;

function Thrones(parentGameObject)
{
    let _value = [];
    const _parentGame = parentGameObject;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        return `${_value[0]} Level One, ${_value[1]} Level Two, ${_value[2]} Level Three`;
    };
    
    this.setValue = (input) =>
    {
        const settingsObject = _parentGame.getSettingsObject();
        const apSetting = settingsObject.getAscensionPointsSetting();
        const apValue = apSetting.getValue();
        const validatedValue = _validateInputFormatOrThrow(input, apValue);

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
        let value = this.getValue();
    
        return [`--thrones`, ...value];
    };

    function _validateInputFormatOrThrow(input, apValue)
    {
        let thrones = [];

        if (Thrones.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for thrones.`);

        input.split(",").forEach((throneLevel) =>
        {
            thrones.push(+throneLevel.replace(/\D*/g, ""));
        });

        if (thrones.length < 3)
            throw new SemanticError(`Throne values missing; expected 3 values, got ${thrones}`);

        if (thrones[0] < 0 || thrones[0] > 20)
            throw new SemanticError(`Level 1 thrones must be between 0 and 20`);

        if (thrones[1] < 0 || thrones[1] > 15)
            throw new SemanticError(`Level 2 thrones must be between 0 and 15`);

        if (thrones[2] < 0 || thrones[2] > 10)
            throw new SemanticError(`Level 3 thrones must be between 0 and 10`);

        if (thrones[0] + thrones[1] + thrones[2] <= 0)
            throw new SemanticError(`At least one throne is required`);

        if (thrones[0] + (thrones[1] * 2) + (thrones[2] * 3) < apValue)
            throw new SemanticError(`Sum of the throne points must be at least as high as the ascension points required`);

        return thrones;
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Thrones constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Thrones.prototype = new GameSetting(key, dom5SettingsData[key]);
Thrones.prototype.constructor = Thrones;
