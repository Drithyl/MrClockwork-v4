"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "era";
module.exports = Era;
function Era() {
    var _this = this;
    var _value;
    this.getValue = function () { return _value; };
    this.getReadableValue = function () {
        var value = _this.getValue();
        if (value == 1)
            return "Early Age";
        if (value === 2)
            return "Middle Age";
        if (value === 3)
            return "Late Age";
        else
            return "invalid value";
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
        return ["--era", value];
    };
    function _validateInputFormatOrThrow(input) {
        if (Era.prototype.isExpectedFormat(input) === false)
            throw new SemanticError("Invalid value format for era.");
        return +input.replace(/\D*/, "");
    }
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Era constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Era.prototype = new GameSetting(key);
Era.prototype.constructor = Era;
Era.prototype.getPrompt = function () { return Era.prototype.getDescription(); };
//# sourceMappingURL=era.js.map