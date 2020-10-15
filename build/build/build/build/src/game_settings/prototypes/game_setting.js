"use strict";
var assert = require("../../asserter.js");
var dom5SettingsData = require("../../json/dom5_settings.json");
module.exports = GameSetting;
function GameSetting(key) {
    var data = dom5SettingsData[key];
    assert.isObjectOrThrow(data);
    var _key = key;
    var _name = data.name;
    var _description = data.description;
    var _defaultValue = data.defaultInput;
    var _expectedInputFormatRegexp = new RegExp(data.expectedInputFormatRegexp, "i");
    this.getKey = function () { return _key; };
    this.getName = function () { return _name; };
    this.getDefault = function () { return _defaultValue; };
    this.getDescription = function () { return _description; };
    this.getParseRegexp = function () { return _regexp; };
    this.isExpectedFormat = function (str) { return _expectedInputFormatRegexp.test(str); };
}
GameSetting.prototype.getPrompt = function () { return "No prompt behaviour defined."; };
this.translateValueToCmdFlag = function () { return "No cmd flag defined."; };
//# sourceMappingURL=game_setting.js.map