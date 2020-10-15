"use strict";
var dom5SettingsData = require("../../json/dom5_settings.json");
var SemanticError = require("../../errors/custom_errors").SemanticError;
function HostMenu(dom5Game) {
    var _dom5Game = dom5Game;
    var _currentSettingIndex = 0;
    this.handleInput = function (input) {
        var _dom5SettingsObject = _dom5Game.getSettingsObject();
        var _settingKey = settingsOrder[_currentSettingIndex];
        var _settingData = dom5SettingsData[_settingKey];
        var _regexp = new RegExp(_settingData.expectedInputFormatRegexp);
        if (_regexp.test(input) === false)
            throw SemanticError("Invalid format.");
        return _dom5Game.emitPromiseToHostServer("VERIFY_MAP", input)
            .then(function () { return _mapObject.setValue(input); });
    };
}
function validateSetting(input, settingKey) {
    var _settingData = dom5SettingsData[settingKey];
    var _regexp = new RegExp(_settingData.expectedInputFormatRegexp);
    if (_regexp.test(input) === false)
        throw SemanticError("Invalid format. Please re-read the cue and make sure your input is correct.");
}
var settingsOrder = [
    "name",
    "map",
    "mods",
    "era",
    "aiNations",
    "defaultAiLevel",
    "artifactForging",
    "cataclysm",
    "disciples",
    "storyEvents",
    "eventRarity",
    "globalSlots",
    "goldModifier",
    "resourcesModifier",
    "suppliesModifier",
    "recruitmentModifier",
    "hallOfFame",
    "independentsStrength",
    "magicSites",
    "masterPassword",
    "researchSpeed",
    "scoregraphs",
    "startingProvinces",
    "startingResearch",
    "thrones",
    "timer"
];
//# sourceMappingURL=host_menu_whole.js.map