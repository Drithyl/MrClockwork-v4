"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "eventRarity";
module.exports = EventRarity;
function EventRarity() {
    var _this = this;
    var _value;
    this.getValue = function () { return _value; };
    this.getReadableValue = function () {
        var value = _this.getValue();
        if (value == 1)
            return "Common";
        if (value === 2)
            return "Rare";
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
        return ["--eventrarity", value];
    };
    function _validateInputFormatOrThrow(input) {
        if (EventRarity.prototype.isExpectedFormat(input) === false)
            throw new SemanticError("Invalid value format for the event rarity.");
        return +input.replace(/\D*/, "");
    }
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the EventRarity constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
EventRarity.prototype = new GameSetting(key);
EventRarity.prototype.constructor = EventRarity;
EventRarity.prototype.getPrompt = function () { return EventRarity.prototype.getDescription(); };
//# sourceMappingURL=event_rarity.js.map