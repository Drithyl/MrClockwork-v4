"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "globalSlots";
module.exports = GlobalSlots;
function GlobalSlots() {
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
        return ["--globals", value];
    };
    function _validateInputFormatOrThrow(input) {
        if (GlobalSlots.prototype.isExpectedFormat(input) === false)
            throw new SemanticError("Invalid value format for global slots.");
        return +input.replace(/\D*/, "");
    }
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the GlobalSlots constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
GlobalSlots.prototype = new GameSetting(key);
GlobalSlots.prototype.constructor = GlobalSlots;
GlobalSlots.prototype.getPrompt = function () { return GlobalSlots.prototype.getDescription(); };
//# sourceMappingURL=global_slots.js.map