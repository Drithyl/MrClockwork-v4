"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "mods";
module.exports = Mods;
function Mods(parentGameObject) {
    var _this = this;
    var _value;
    var _parentGame = parentGameObject;
    this.getValue = function () { return _value; };
    this.getReadableValue = function () {
        if (Array.isArray(_value) === false)
            return "None";
        return _value.join(", ");
    };
    this.setValue = function (value) {
        if (Array.isArray(value) === false)
            _value = null;
        else
            _value = value;
    };
    this.setValue = function (input) {
        return _validateInputFormatOrThrow(input)
            .then(function (validatedValue) { return _value = validatedValue; });
    };
    this.fromJSON = function (value) {
        if (Array.isArray(value) === false)
            throw new Error("Expected array of strings; got " + value);
        value.forEach(function (modFilename) {
            if (typeof modFilename !== "string")
                throw new Error("Expected string; got " + modFilename);
        });
        _value = value;
    };
    this.translateValueToCmdFlag = function () {
        var modArray = _this.getValue();
        var flagArr = [];
        if (modArray == null)
            return [];
        modArray.forEach(function (modFilename) {
            flagArr.push("--enablemod", modFilename);
        });
        return flagArr;
    };
    function _validateInputFormatOrThrow(input) {
        var modFilenames = [];
        if (Mods.prototype.isExpectedFormat(input) === false)
            Promise.reject(new SemanticError("Invalid value format for the mods."));
        if (input.toLowerCase() === "none")
            return Promise.resolve(null);
        input.split(",").forEach(function (modFilename) {
            modFilenames.push(modFilename.trim());
        });
        return _parentGame.emitPromiseToHostServer("VERIFY_MODS", modFilenames)
            .then(function () { return Promise.resolve(modFilenames); });
    }
    ;
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Mods constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Mods.prototype = new GameSetting(key);
Mods.prototype.constructor = Mods;
Mods.prototype.getPrompt = function () { return Mods.prototype.getDescription(); };
//# sourceMappingURL=mods.js.map