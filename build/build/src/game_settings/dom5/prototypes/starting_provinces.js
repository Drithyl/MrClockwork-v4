"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "startingProvinces";
module.exports = StartingProvinces;
function StartingProvinces() {
    var _this = this;
    var _value;
    this.getValue = function () { return _value; };
    this.getReadableValue = function () {
        var value = _this.getValue();
        return value;
    };
    this.setValue = function (input) {
        var validatedValue = _validateInputFormatOrThrow(input);
        _value = validatedValue;
    };
    this.fromJSON = function (value) {
        if (Number.isInteger(value) === false)
            throw new Error("Expected integer; got " + value);
        _value = value;
    };
    this.translateValueToCmdFlag = function () {
        var value = _this.getValue();
        return ["--startprov", value];
    };
    function _validateInputFormatOrThrow(input) {
        if (StartingProvinces.prototype.isExpectedFormat(input) === false)
            throw new SemanticError("Invalid value format for the starting provinces.");
        return +input.replace(/\D*/, "");
    }
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the StartingProvinces constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
StartingProvinces.prototype = new GameSetting(key);
StartingProvinces.prototype.constructor = StartingProvinces;
StartingProvinces.prototype.getPrompt = function () { return StartingProvinces.prototype.getDescription(); };
//# sourceMappingURL=starting_provinces.js.map