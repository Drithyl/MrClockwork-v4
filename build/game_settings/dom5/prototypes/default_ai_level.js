"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var dom5SettingFlags = require("../../../json/dominions5_setting_flags.json");
var key = "defaultAiLevel";
module.exports = DefaultAiLevel;
function DefaultAiLevel() {
    var _this = this;
    var _value;
    this.getValue = function () { return _value; };
    this.getReadableValue = function () {
        var value = _this.getValue();
        if (value === dom5SettingFlags.NO_GOING_AI)
            return "No going AI";
        if (value === dom5SettingFlags.EASY_PLAYER_AI)
            return dom5SettingFlags.EASY_AI;
        if (value === dom5SettingFlags.NORMAL_PLAYER_AI)
            return dom5SettingFlags.NORMAL_AI;
        if (value === dom5SettingFlags.DIFFICULT_PLAYER_AI)
            return dom5SettingFlags.DIFFICULT_AI;
        if (value === dom5SettingFlags.MIGHTY_PLAYER_AI)
            return dom5SettingFlags.MIGHTY_AI;
        if (value === dom5SettingFlags.MASTER_PLAYER_AI)
            return dom5SettingFlags.MASTER_AI;
        if (value === dom5SettingFlags.IMPOSSIBLE_PLAYER_AI)
            return dom5SettingFlags.IMPOSSIBLE_AI;
        else
            return "Invalid value";
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
        if (value == 0)
            return ["--nonewai"];
        if (value >= 1 && value <= 6)
            return ["--newailvl " + value];
        else
            return [];
    };
    function _validateInputFormatOrThrow(input) {
        if (DefaultAiLevel.prototype.isExpectedFormat(input) === false)
            throw new SemanticError("Invalid value format for the default AI level.");
        return +input.replace(/\D*/, "");
    }
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the DefaultAiLevel constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
DefaultAiLevel.prototype = new GameSetting(key);
DefaultAiLevel.prototype.constructor = DefaultAiLevel;
DefaultAiLevel.prototype.getPrompt = function () { return DefaultAiLevel.prototype.getDescription(); };
//# sourceMappingURL=default_ai_level.js.map