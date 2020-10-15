"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "thrones";
module.exports = Thrones;
function Thrones() {
    var _this = this;
    var _value;
    this.getValue = function () { return _value; };
    this.getReadableValue = function () {
        return _value[0] + " Level One, " + _value[1] + " Level Two, " + _value[2] + " Level Three";
    };
    this.setValue = function (input) {
        var validatedValue = _validateInputFormatOrThrow(input);
        _value = validatedValue;
    };
    this.fromJSON = function (value) {
        if (Array.isArray(value) === false)
            throw new Error("Expected array of integers; got " + value);
        value.forEach(function (throneNbr) {
            if (Number.isInteger(throneNbr) === false)
                throw new Error("Expected integer; got " + throneNbr);
        });
        _value = value;
    };
    this.translateValueToCmdFlag = function () {
        var value = _this.getValue();
        return ["--thrones", value[0], value[1], value[2]];
    };
    function _validateInputFormatOrThrow(input) {
        var thrones = [];
        if (Thrones.prototype.isExpectedFormat(input) === false)
            throw new SemanticError("Invalid value format for thrones.");
        input.split(",").forEach(function (throneLevel) {
            thrones.push(+throneLevel.replace(/\D*/, ""));
        });
        return thrones;
    }
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Thrones constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Thrones.prototype = new GameSetting(key);
Thrones.prototype.constructor = Thrones;
Thrones.prototype.getPrompt = function () { return Thrones.prototype.getDescription(); };
//# sourceMappingURL=thrones.js.map