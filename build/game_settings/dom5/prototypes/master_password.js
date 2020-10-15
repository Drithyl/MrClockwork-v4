"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "masterPassword";
module.exports = MasterPassword;
function MasterPassword() {
    var _this = this;
    var _value;
    this.getValue = function () { return _value; };
    this.getReadableValue = function () {
        return _this.getValue();
    };
    this.setValue = function (input) {
        var validatedValue = _validateInputFormatOrThrow(input);
        _value = validatedValue;
    };
    this.fromJSON = function (value) {
        if (typeof value !== "string")
            throw new Error("Expected string; got " + value);
        _value = value;
    };
    this.translateValueToCmdFlag = function () {
        var value = _this.getValue();
        return ["--masterpass", value];
    };
    function _validateInputFormatOrThrow(input) {
        if (MasterPassword.prototype.isExpectedFormat(input) === input)
            throw new SemanticError("Invalid value format for the master password.");
        return input;
    }
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the MasterPassword constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
MasterPassword.prototype = new GameSetting(key);
MasterPassword.prototype.constructor = MasterPassword;
MasterPassword.prototype.getPrompt = function () { return MasterPassword.prototype.getDescription(); };
//# sourceMappingURL=master_password.js.map