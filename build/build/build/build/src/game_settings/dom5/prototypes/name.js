"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var ongoingGamesStore = require("../../../games/ongoing_games_store.js");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "name";
module.exports = Name;
function Name() {
    var _this = this;
    var _value;
    this.getValue = function () { return _value; };
    this.getReadableValue = function () {
        return _this.getValue();
    };
    this.setValue = function (input) {
        var validatedValue = _validateInputFormatOrThrow(input);
        if (ongoingGamesStore.isNameAvailable(validatedValue) === false)
            throw new SemanticError("This name is already in use.");
        _value = validatedValue;
    };
    this.fromJSON = function (value) {
        if (typeof value !== "string")
            throw new Error("Expected string; got " + value);
        _value = value;
    };
    this.translateValueToCmdFlag = function () {
        var value = _this.getValue();
        return [value];
    };
    function _validateInputFormatOrThrow(input) {
        if (Name.prototype.isExpectedFormat(input) === false)
            throw new SemanticError("Invalid value format for the game's name.");
        return input;
    }
    ;
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Name constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Name.prototype = new GameSetting(key);
Name.prototype.constructor = Name;
Name.prototype.getPrompt = function () { return Name.prototype.getDescription(); };
//# sourceMappingURL=name.js.map