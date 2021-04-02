
const GameSetting = require("../../prototypes/game_setting.js");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "mods";

module.exports = Mods;

function Mods(parentGameObject)
{
    var _value;
    const _parentGame = parentGameObject;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        if (Array.isArray(_value) === false)
            return "None";

        return _value.join(", ");
    };

    this.setValue = (input) =>
    {
        return _validateInputFormatOrThrow(input)
        .then((validatedValue) => _value = validatedValue);
    };

    this.fromJSON = (value) =>
    {
        if (Array.isArray(value) === false)
            throw new Error(`Expected array of strings; got ${value}`);

        value.forEach((modFilename) =>
        {
            if (typeof modFilename !== "string")
                throw new Error(`Expected string; got ${modFilename}`);
        });

        _value = value;
    };

    this.translateValueToCmdFlag = () =>
    {
        var modArray = this.getValue();
        var flagArr = [];
    
        if (modArray == null)
            return [];
    
        modArray.forEach((modFilename) =>
        {
            flagArr.push(`--enablemod`, modFilename);
        });
    
        return flagArr;
    };

    function _validateInputFormatOrThrow(input)
    {
        var modFilenames = [];

        if (Mods.prototype.isExpectedFormat(input) === false)
            Promise.reject(new SemanticError(`Invalid value format for the mods.`));

        if (input.toLowerCase() === "none")
            return Promise.resolve(modFilenames);

        input.split(",").forEach((modFilename) =>
        {
            modFilenames.push(modFilename.trim());
        });

        return _parentGame.emitPromiseToServer("VERIFY_MODS", modFilenames)
        .then(() => Promise.resolve(modFilenames));
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Mods constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Mods.prototype = new GameSetting(key);
Mods.prototype.constructor = Mods;
