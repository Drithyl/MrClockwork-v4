"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "disciples";
module.exports = Disciples;
function Disciples() {
    var _this = this;
    var _value;
    this.getValue = function () { return _value; };
    this.getReadableValue = function () {
        var value = _this.getValue();
        if (value == 0)
            return "false";
        if (value === 1)
            return "true";
        if (value === 2)
            return "true, clustered starts";
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
        if (value == 1)
            return ["--teamgame"];
        else if (value == 2)
            return ["--teamgame", "--clustered"];
        else
            return [];
    };
    function _validateInputFormatOrThrow(input) {
        if (Disciples.prototype.isExpectedFormat(input) === false)
            throw new SemanticError("Invalid value format for disciples.");
        return +input.replace(/\D*/, "");
    }
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Disciples constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Disciples.prototype = new GameSetting(key);
Disciples.prototype.constructor = Disciples;
Disciples.prototype.getPrompt = function () { return Disciples.prototype.getDescription(); };
//# sourceMappingURL=disciples.js.map