"use strict";
var text = require("express").text;
var GameSetting = require("../../prototypes/game_setting.js");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "map";
module.exports = Map;
function Map(parentGameObject) {
    var _this = this;
    var _value;
    var _parentGame = parentGameObject;
    this.getValue = function () { return _value; };
    this.getReadableValue = function () {
        return _this.getValue();
    };
    this.setValue = function (input) {
        var validatedValue = _validateInputFormatOrThrow(input);
        return _parentGame.emitPromiseToHostServer("VERIFY_MAP", validatedValue)
            .then(function () { return _value = validatedValue; });
    };
    this.fromJSON = function (value) {
        if (typeof value !== "string" || /.map$/i.test(value) === false)
            throw new Error("Expected string ending with .map; got " + value);
        _value = value;
    };
    this.translateValueToCmdFlag = function () {
        var value = _this.getValue();
        return ["--mapfile", value];
    };
    function _validateInputFormatOrThrow(input) {
        if (Map.prototype.isExpectedFormat(input) === false)
            throw new SemanticError("Invalid value format for the map.");
        return input;
    }
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Map constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Map.prototype = new GameSetting(key);
Map.prototype.constructor = Map;
Map.prototype.getPrompt = function () { return Map.prototype.getDescription(); };
//# sourceMappingURL=map.js.map