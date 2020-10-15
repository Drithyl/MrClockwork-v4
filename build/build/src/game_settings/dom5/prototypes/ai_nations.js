"use strict";
var GameSetting = require("../../prototypes/game_setting.js");
var dom5NationStore = require("../../../games/dominions5_nation_store.js");
var dom5SettingFlags = require("../../../json/dominions5_setting_flags.json");
var SemanticError = require("../../../errors/custom_errors.js").SemanticError;
var key = "aiNations";
module.exports = AiNations;
function AiNations(parentGameObject) {
    var _this = this;
    var _value;
    var _parentGame = parentGameObject;
    this.getValue = function () { return _value; };
    this.getReadableValue = function () {
        var str = "";
        var aiNations = _this.getValue();
        if (aiNations == null)
            return "None";
        Object.keys(aiNations).forEach(function (nationNbr, i) {
            var difficulty = aiNations[nationNbr];
            var nationObject = dom5NationStore.getNation(nationNbr);
            if (i > 0)
                str += ", ";
            str += nationObject.getName() + ": " + difficulty;
        });
        return str;
    };
    this.setValue = function (input) {
        var settingsObject = _parentGame.getSettingsObject();
        var eraSetting = settingsObject.getEraSetting();
        var era = eraSetting.getValue();
        var aiNations = _validateInputFormatOrThrow(input, era);
        _value = aiNations;
    };
    this.fromJSON = function (value) {
        if (typeof value !== "object")
            throw new Error("Expected object; got " + value);
        for (var nationNbr in value) {
            var nationDifficulty = value[nationNbr];
            if (Number.isInteger(+nationNbr) === false)
                throw new Error("Expected string resolvable to integer; got " + nationNbr);
            if (typeof nationDifficulty !== "string")
                throw new Error("Expected string; got " + nationDifficulty);
        }
        _value = value;
    };
    this.translateValueToCmdFlag = function () {
        var flags = [];
        var aiNations = _this.getValue();
        if (aiNations == null)
            return flags;
        for (var nationNbr in aiNations) {
            var difficulty = aiNations[nationNbr];
            if (difficulty === dom5SettingFlags.EASY_AI)
                flags.push("--easyai", nationNbr);
            else if (difficulty === dom5SettingFlags.NORMAL_AI)
                flags.push("--normai", nationNbr);
            else if (difficulty === dom5SettingFlags.DIFFICULT_AI)
                flags.push("--diffai", nationNbr);
            else if (difficulty === dom5SettingFlags.MIGHTY_AI)
                flags.push("--mightyai", nationNbr);
            else if (difficulty === dom5SettingFlags.MASTER_AI)
                flags.push("--masterai", nationNbr);
            else if (difficulty === dom5SettingFlags.IMPOSSIBLE_AI)
                flags.push("--impai", nationNbr);
        }
        return flags;
    };
    function _validateInputFormatOrThrow(input, era) {
        var aiNations = {};
        if (AiNations.prototype.isExpectedFormat(input) === false)
            throw new SemanticError("Invalid value format for AI nations.");
        input.split(",").forEach(function (aiNationStr) {
            var nationNbr = +aiNationStr.replace(/\D*/ig, "");
            var nationDifficulty = aiNationStr.replace(/\d*/ig, "").trim().toLowerCase();
            if (dom5NationStore.isValidNationIdentifierInEra(nationNbr, era) === false)
                throw new SemanticError("Nation number " + nationNbr + " does not exist in chosen era.");
            aiNations[nationNbr] = nationDifficulty;
        });
        return aiNations;
    }
}
//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the AiNations constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
AiNations.prototype = new GameSetting(key);
AiNations.prototype.constructor = AiNations;
AiNations.prototype.getPrompt = function () { return AiNations.prototype.getDescription(); };
//# sourceMappingURL=ai_nations.js.map