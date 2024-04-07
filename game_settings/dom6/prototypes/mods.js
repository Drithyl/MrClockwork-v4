const path = require("path");
const assert = require("../../../asserter.js");
const config = require("../../../config/config.json");
const GameSetting = require("../../prototypes/game_setting.js");
const dom6SettingsData = require("../../../json/dom6_settings.json");
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

        return _value.map((modFilepath) => path.basename(modFilepath)).join(", ");
    };

    this.setValue = (input) =>
    {
        return _validateInputFormatOrThrow(input)
        .then((validatedValue) => _value = validatedValue);
    };

    this.fromJSON = (value, needsPatching = false) =>
    {
        if (needsPatching === true)
            value = _patchFromV3(value);
            
        if (Array.isArray(value) === false)
            throw new Error(`Expected array of strings; got ${value}`);

        value.forEach((modFilename) =>
        {
            if (typeof modFilename !== "string")
                throw new Error(`Expected string with .dm extension; got ${modFilename}`);

            if (/.dm$/i.test(value) === false)
                modFilename += ".dm";
        });

        _value = value;
    };

    this.translateValueToCmdFlag = () =>
    {
        var modArray = this.getValue();
        var flagArr = [];
    
        if (modArray == null)
            return [];
    
        modArray.forEach((relativeModPath) =>
        {
            flagArr.push(`--enablemod`, relativeModPath);
        });
    
        return flagArr;
    };

    function _validateInputFormatOrThrow(input)
    {
        var modFilenames = [];

        if (assert.isString(input) === false)
            return Promise.reject(new SemanticError(`Expected mods string; got <${input}>`));

        if (input.toLowerCase() === "none")
            return Promise.resolve(modFilenames);

        const inputModFilenames = input.split(/,\s*/);

        for (let i = 0; i < inputModFilenames.length; i++) {
            const modFilename = inputModFilenames[i];

            if (Mods.prototype.isExpectedFormat(modFilename) === false)
                return Promise.reject(new SemanticError(`Invalid value format for modfile <${modFilename}>`));

            
            if (/\.dm$/.test(modFilename) === false)
                modFilenames.push(modFilename.trim() + ".dm");

            else modFilenames.push(modFilename.trim());
        }

        return _parentGame.emitPromiseToServer("VERIFY_MODS", { filenames: modFilenames, gameType: config.dom6GameTypeName})
        .then(() => Promise.resolve(modFilenames));
    }

    function _patchFromV3(value)
    {
        if (Array.isArray(value) === true)
            return value;

        else return [];
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Mods constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Mods.prototype = new GameSetting(key, dom6SettingsData[key]);
Mods.prototype.constructor = Mods;
