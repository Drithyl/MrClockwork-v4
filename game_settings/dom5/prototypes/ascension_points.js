
const assert = require("../../../asserter.js");
const GameSetting = require("../../prototypes/game_setting.js");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "ascensionPoints";

module.exports = AscensionPoints;

function AscensionPoints(parentGameObject)
{
    let _value;
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
        let value = this.getValue();
    
        return [`--requiredap`, value];
    };

    function _validateInputFormatOrThrow(input, thrones)
    {
        if (AscensionPoints.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for ascension points.`);

        const points = +input.replace(/\D*/, "");

        if (points <= 0 || points > 80)
            throw new SemanticError(`Ascension Points required must be between 1 and 80`);

        if (assert.isArray(thrones) === true && thrones[0] + (thrones[1] * 2) + (thrones[2] * 3) < points)
            throw new SemanticError(`Sum of the throne points must be at least as high as the ascension points required`);

        return points;
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the AscensionPoints constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
AscensionPoints.prototype = new GameSetting(key);
AscensionPoints.prototype.constructor = AscensionPoints;
