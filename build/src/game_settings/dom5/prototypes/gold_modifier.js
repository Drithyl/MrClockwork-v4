"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "goldModifier";
module.exports = GoldModifier;
function GoldModifier() {
    var _this = this;
    var _value;
    this.getValue = function () { return _value; };
    this.getReadableValue = function () {
        return _value + "%";
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
        return ["--richness", value];
    };
    function _validateInputFormatOrThrow(input) {
        if (GoldModifier.prototype.isExpectedFormat(input) === input)
            throw new SemanticError("Invalid value format for the gold modifier.");
        return +input.replace(/\D*/, "");
    }
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the GoldModifier constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
GoldModifier.prototype = new GameSetting(key);
GoldModifier.prototype.constructor = GoldModifier;
GoldModifier.prototype.getPrompt = function () { return GoldModifier.prototype.getDescription(); };
//# sourceMappingURL=gold_modifier.js.map