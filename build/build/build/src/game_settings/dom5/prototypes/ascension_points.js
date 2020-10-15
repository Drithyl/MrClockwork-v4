"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "ascensionPoints";
module.exports = AscensionPoints;
function AscensionPoints() {
    var _this = this;
    var _value;
    this.getValue = function () { return _value; };
    this.getReadableValue = function () { return _value; };
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
        return ["--requiredap", value];
    };
    function _validateInputFormatOrThrow(input) {
        if (AscensionPoints.prototype.isExpectedFormat(input) === false)
            throw new SemanticError("Invalid value format for ascension points.");
        return +input.replace(/\D*/, "");
    }
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the AscensionPoints constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
AscensionPoints.prototype = new GameSetting(key);
AscensionPoints.prototype.constructor = AscensionPoints;
AscensionPoints.prototype.getPrompt = function () { return AscensionPoints.prototype.getDescription(); };
//# sourceMappingURL=ascension_points.js.map