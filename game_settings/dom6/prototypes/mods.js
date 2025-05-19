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
        const _validatedValue = _validateInputFormatOrThrow(input);
        _value = _validatedValue;
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
            throw new SemanticError(`Expected mods string; got <${input}>`);

        if (input.toLowerCase() === "none")
            return modFilenames;

        const inputModFilenames = input.split(/,\s*/);

        for (let i = 0; i < inputModFilenames.length; i++) {
            const modFilename = inputModFilenames[i];
            const modPath = path.parse(modFilename);
            let fullPath;

            // If mod was given as a filename without its dir, try adding the dir.
            // The assumption is that the directory is the same name as the mod file
            // (this is what Dominions 6 expects).
            if (modPath.dir === "") {
                modPath.dir = modPath.name;
            }

            fullPath = modPath.root + modPath.dir + path.sep +  modPath.base;

            if (Mods.prototype.isExpectedFormat(fullPath) === false)
                throw new SemanticError(`Invalid value format for modfile <${fullPath}>`);

            if (/\.dm$/.test(fullPath) === false)
                modFilenames.push(fullPath.trim() + ".dm");

            else modFilenames.push(fullPath.trim());
        }

        return modFilenames;
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
