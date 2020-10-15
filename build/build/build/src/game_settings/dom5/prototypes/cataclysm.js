"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "cataclysm";
module.exports = Cataclysm;
function Cataclysm() {
    var _this = this;
    var _value;
    this.getValue = function () { return _value; };
    this.getReadableValue = function () { return "Turn " + _value; };
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
        if (value > 0)
            return ["--cataclysm " + value];
        else
            return [];
    };
    function _validateInputFormatOrThrow(input) {
        if (Cataclysm.prototype.isExpectedFormat(input) === false)
            throw new SemanticError("Invalid value format for cataclysm.");
        return +input.replace(/\D*/, "");
    }
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Cataclysm constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Cataclysm.prototype = new GameSetting(key);
Cataclysm.prototype.constructor = Cataclysm;
Cataclysm.prototype.getPrompt = function () { return Cataclysm.prototype.getDescription(); };
//# sourceMappingURL=cataclysm.js.map