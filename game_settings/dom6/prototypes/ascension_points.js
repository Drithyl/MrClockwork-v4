
const assert = require("../../../asserter.js");
const GameSetting = require("../../prototypes/game_setting.js");
const dom6SettingsData = require("../../../json/dom6_settings.json");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "ascensionPoints";

module.exports = AscensionPoints;

function AscensionPoints(parentGameObject)
{
    var _value;
    const _parentGame = parentGameObject;

    this.getValue = () => _value;
    this.getReadableValue = () => _value;
    
    this.setValue = (input) =>
    {
        const settingsObject = _parentGame.getSettingsObject();
        const thronesSetting = settingsObject.getThronesSetting();
        const thrones = thronesSetting.getValue();
        const validatedValue = _validateInputFormatOrThrow(input, thrones);

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

    function _validateInputFormatOrThrow(input, thrones)
    {
        if (AscensionPoints.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for ascension points.`);

        const points = +input.replace(/\D*/, "");

        if (points <= 0 || points > 80)
            throw new SemanticError(`Ascension Points required must be between 1 and 80`);

        return points;
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the AscensionPoints constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
AscensionPoints.prototype = new GameSetting(key, dom6SettingsData[key]);
AscensionPoints.prototype.constructor = AscensionPoints;
