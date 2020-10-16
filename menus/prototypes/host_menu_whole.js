
const dom5SettingsData = require("../../json/dom5_settings.json");
const { SemanticError } = require("../../errors/custom_errors");

function HostMenu(dom5Game)
{
    const _dom5Game = dom5Game;

    var _currentSettingIndex = 0;

    this.handleInput = (input) =>
    {
        const _dom5SettingsObject = _dom5Game.getSettingsObject();
        const _settingKey = settingsOrder[_currentSettingIndex];
        const _settingData = dom5SettingsData[_settingKey];
        const _regexp = new RegExp(_settingData.expectedInputFormatRegexp);

        if (_regexp.test(input) === false)
            throw SemanticError("Invalid format.");
            
        return _dom5Game.emitPromiseToHostServer("VERIFY_MAP", input)
        .then(() => _mapObject.setValue(input));
    };

}

function validateSetting(input, settingKey)
{
    const _settingData = dom5SettingsData[settingKey];
    const _regexp = new RegExp(_settingData.expectedInputFormatRegexp);

    if (_regexp.test(input) === false)
        throw SemanticError("Invalid format. Please re-read the cue and make sure your input is correct.");
}

const settingsOrder = [
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