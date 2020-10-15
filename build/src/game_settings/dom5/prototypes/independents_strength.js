"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "independentsStrength";
module.exports = IndependentsStrength;
function IndependentsStrength() {
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
        return ["--indepstr", value];
    };
    function _validateInputFormatOrThrow(input) {
        if (IndependentsStrength.prototype.isExpectedFormat(input) === false)
            throw new SemanticError("Invalid value format for independents' strength.");
        return +input.replace(/\D*/, "");
    }
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the IndependentsStrength constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
IndependentsStrength.prototype = new GameSetting(key);
IndependentsStrength.prototype.constructor = IndependentsStrength;
IndependentsStrength.prototype.getPrompt = function () { return IndependentsStrength.prototype.getDescription(); };
//# sourceMappingURL=independents_strength.js.map