
const GameSetting = require("../../prototypes/game_setting.js");
const dom5NationStore = require("../../../games/dominions5_nation_store.js");
const dom5SettingFlags = require("../../../json/dominions5_setting_flags.json");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "aiNations";

module.exports = AiNations;

function AiNations(parentGameObject)
{
    var _value;
    const _parentGame = parentGameObject;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        var str = "";
        var aiNations = this.getValue();

        if (aiNations == null)
            return "None";

        Object.keys(aiNations).forEach((nationNbr, i) =>
        {
            var difficulty = aiNations[nationNbr];
            var nationObject = dom5NationStore.getNation(nationNbr);

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

        for (var nationNbr in value)
        {
            var nationDifficulty = value[nationNbr];

            if (Number.isInteger(+nationNbr) === false)
                throw new Error(`Expected string resolvable to integer; got ${nationNbr}`);

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
    
        for (var nationNbr in aiNations)
        {
            var difficulty = aiNations[nationNbr];
    
            if (difficulty === dom5SettingFlags.EASY_AI)
                flags.push(`--easyai`, nationNbr);
    
            else if (difficulty === dom5SettingFlags.NORMAL_AI)
                flags.push(`--normai`, nationNbr);
    
            else if (difficulty === dom5SettingFlags.DIFFICULT_AI)
                flags.push(`--diffai`, nationNbr);
    
            else if (difficulty === dom5SettingFlags.MIGHTY_AI)
                flags.push(`--mightyai`, nationNbr);
    
            else if (difficulty === dom5SettingFlags.MASTER_AI)
                flags.push(`--masterai`, nationNbr);
    
            else if (difficulty === dom5SettingFlags.IMPOSSIBLE_AI)
                flags.push(`--impai`, nationNbr);
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
            var nationNbr = +aiNationStr.replace(/\D*/ig, "");
            var nationDifficulty = aiNationStr.replace(/\d*/ig, "").trim().toLowerCase();

            if (dom5NationStore.isValidNationIdentifierInEra(nationNbr, era) === false)
                throw new SemanticError(`Nation number ${nationNbr} does not exist in chosen era.`);

            aiNations[nationNbr] = nationDifficulty;
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
AiNations.prototype = new GameSetting(key);
AiNations.prototype.constructor = AiNations;
