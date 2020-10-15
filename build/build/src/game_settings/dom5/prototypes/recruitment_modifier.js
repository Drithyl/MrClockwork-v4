"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "recruitmentModifier";
module.exports = RecruitmentModifier;
function RecruitmentModifier() {
    var _this = this;
    var _value;
    this.getValue = function () { return _value; };
    this.getReadableValue = function () {
        var value = _this.getValue();
        return value + "%";
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
        return ["--recruitment", value];
    };
    function _validateInputFormatOrThrow(input) {
        if (RecruitmentModifier.prototype.isExpectedFormat(input) === false)
            throw new SemanticError("Invalid value format for the recruitment modifier.");
        return +input.replace(/\D*/, "");
    }
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the RecruitmentModifier constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
RecruitmentModifier.prototype = new GameSetting(key);
RecruitmentModifier.prototype.constructor = RecruitmentModifier;
RecruitmentModifier.prototype.getPrompt = function () { return RecruitmentModifier.prototype.getDescription(); };
//# sourceMappingURL=recruitment_modifier.js.map