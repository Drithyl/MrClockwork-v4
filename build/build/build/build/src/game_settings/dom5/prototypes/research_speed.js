"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var dom5SettingFlags = require("../../../json/dominions5_setting_flags.json");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "researchSpeed";
module.exports = ResearchSpeed;
function ResearchSpeed() {
    var _this = this;
    var _value;
    this.getValue = function () { return _value; };
    this.getReadableValue = function () {
        var value = _this.getValue();
        if (value == dom5SettingFlags.VERY_EASY_RESEARCH_SPEED)
            return "Very Easy";
        if (value == dom5SettingFlags.EASY_RESEARCH_SPEED)
            return "Easy";
        if (value == dom5SettingFlags.HARD_RESEARCH_SPEED)
            return "Hard";
        if (value == dom5SettingFlags.VERY_HARD_RESEARCH_SPEED)
            return "Very Hard";
        //default value
        else
            return "Normal";
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
        return ["--research", value];
    };
    function _validateInputFormatOrThrow(input) {
        if (ResearchSpeed.prototype.isExpectedFormat(input) === false)
            throw new SemanticError("Invalid value format for the research speed.");
        return +input.replace(/\D*/, "");
    }
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the ResearchSpeed constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
ResearchSpeed.prototype = new GameSetting(key);
ResearchSpeed.prototype.constructor = ResearchSpeed;
ResearchSpeed.prototype.getPrompt = function () { return ResearchSpeed.prototype.getDescription(); };
//# sourceMappingURL=research_speed.js.map