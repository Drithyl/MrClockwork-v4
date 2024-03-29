
const GameSetting = require("../../prototypes/game_setting.js");
const dom6SettingsData = require("../../../json/dom6_settings.json");
const domNationStore = require("../../../games/dominions_nation_store.js");
const dom6SettingFlags = require("../../../json/dominions5_setting_flags.json");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "aiNations";

module.exports = AiNations;

function AiNations(parentGameObject)
{
    var _value;
    const _parentGame = parentGameObject;
    const _gameType = _parentGame.getType();

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        var str = "";
        var aiNations = this.getValue();

        if (aiNations == null)
            return "None";

        Object.keys(aiNations).forEach((nationNumber, i) =>
        {
            var difficulty = aiNations[nationNumber];
            var nationObject = domNationStore.getNation(nationNumber, _gameType);

            if (i > 0)
                str += ", ";

            str += `${nationObject.getName()}: ${difficulty}`;
        });

        return str;
    };

    this.setValue = (input) =>
    {
        const settingsObject = _parentGame.getSettingsObject();
        const eraSetting = settingsObject.getEraSetting();
        const era = eraSetting.getValue();
        const aiNations = _validateInputFormatOrThrow(input, era);

        _value = aiNations;
    };

    this.fromJSON = (value, needsPatching = false) =>
    {
        if (needsPatching === true)
            value = _patchFromV3(value);
            
        if (typeof value !== "object")
            throw new Error(`Expected object; got ${value}`);

        for (var nationNumber in value)
        {
            var nationDifficulty = value[nationNumber];

            if (Number.isInteger(+nationNumber) === false)
                throw new Error(`Expected string resolvable to integer; got ${nationNumber}`);

            if (typeof nationDifficulty !== "string")
                throw new Error(`Expected string; got ${nationDifficulty}`);
        }

        _value = value;
    };

    this.translateValueToCmdFlag = () =>
    {
        var flags = [];
        var aiNations = this.getValue();
    
        if (aiNations == null || Object.keys(aiNations).length <= 0)
            return flags;
    
        for (var nationNumber in aiNations)
        {
            var difficulty = aiNations[nationNumber];
    
            if (difficulty === dom6SettingFlags.EASY_AI)
                flags.push(`--easyai`, nationNumber);
    
            else if (difficulty === dom6SettingFlags.NORMAL_AI)
                flags.push(`--normai`, nationNumber);
    
            else if (difficulty === dom6SettingFlags.DIFFICULT_AI)
                flags.push(`--diffai`, nationNumber);
    
            else if (difficulty === dom6SettingFlags.MIGHTY_AI)
                flags.push(`--mightyai`, nationNumber);
    
            else if (difficulty === dom6SettingFlags.MASTER_AI)
                flags.push(`--masterai`, nationNumber);
    
            else if (difficulty === dom6SettingFlags.IMPOSSIBLE_AI)
                flags.push(`--impai`, nationNumber);
        }
    
        return flags;
    };

    function _validateInputFormatOrThrow(input, era)
    {
        var aiNations = {};

        if (AiNations.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for AI nations.`);

        if (input.toLowerCase() === "none")
            return aiNations;

        input.split(",").forEach((aiNationStr) =>
        {
            var nationNumber = +aiNationStr.replace(/\D*/ig, "");
            var nationDifficulty = aiNationStr.replace(/\d*/ig, "").trim().toLowerCase();

            if (domNationStore.isValidNationIdentifierInEra(nationNumber, era, _gameType) === false)
                throw new SemanticError(`Nation number ${nationNumber} does not exist in chosen era.`);

            aiNations[nationNumber] = nationDifficulty;
        });

        return aiNations;
    }

    function _patchFromV3(value)
    {
        if (/^none$/i.test(value) === true)
            return {};

        else return value;
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the AiNations constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
AiNations.prototype = new GameSetting(key, dom6SettingsData[key]);
AiNations.prototype.constructor = AiNations;
