"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "startingResearch";
module.exports = StartingResearch;
function StartingResearch() {
    var _this = this;
    var _value;
    this.getValue = function () { return _value; };
    this.getReadableValue = function () {
        var value = _this.getValue();
        if (value == true)
            return "Random starting research";
        else
            return "Spread starting research";
    };
    this.setValue = function (input) {
        var validatedValue = _validateInputFormatOrThrow(input);
        _value = validatedValue;
    };
    this.fromJSON = function (value) {
        if (typeof value !== "boolean")
            throw new Error("Expected boolean; got " + value);
        _value = value;
    };
    this.translateValueToCmdFlag = function () {
        var value = _this.getValue();
        if (value == true)
            return [];
        else
            return ["--norandres"];
    };
    function _validateInputFormatOrThrow(input) {
        if (StartingResearch.prototype.isExpectedFormat(input) === false)
            throw new SemanticError("Invalid value format for the starting research.");
        if (+input == 0)
            return false;
        else if (+input == 1)
            return true;
    }
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the StartingResearch constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
StartingResearch.prototype = new GameSetting(key);
StartingResearch.prototype.constructor = StartingResearch;
StartingResearch.prototype.getPrompt = function () { return StartingResearch.prototype.getDescription(); };
//# sourceMappingURL=starting_research.js.map