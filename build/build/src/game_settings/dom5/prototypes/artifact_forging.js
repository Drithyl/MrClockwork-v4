"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "artifactForging";
module.exports = ArtifactForging;
function ArtifactForging() {
    var _this = this;
    var _value;
    this.getValue = function () { return _value; };
    this.getReadableValue = function () {
        if (_this.getValue() === true)
            return "Unlimited";
        else
            return "1/turn";
    };
    this.setValue = function (input) {
        var validatedValue = _validateInputFormatOrThrow(input);
        _value = validatedValue;
    };
    this.fromJSON = function (artifactForging) {
        if (typeof artifactForging !== "boolean")
            throw new Error("artifactForging expected boolean; got " + artifactForging);
        _value = artifactForging;
    };
    this.translateValueToCmdFlag = function () {
        var value = _this.getValue();
        if (value === true)
            return ["--noartrest"];
        else
            return [];
    };
    function _validateInputFormatOrThrow(input) {
        if (ArtifactForging.prototype.isExpectedFormat(input) === false)
            throw new SemanticError("Invalid value format for artifact forging.");
        if (+input == 0)
            return false;
        else if (+input == 1)
            return true;
    }
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the ArtifactForging constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
ArtifactForging.prototype = new GameSetting(key);
ArtifactForging.prototype.constructor = ArtifactForging;
ArtifactForging.prototype.getPrompt = function () { return ArtifactForging.prototype.getDescription(); };
//# sourceMappingURL=artifact_forging.js.map