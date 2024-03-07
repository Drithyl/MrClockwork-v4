
const GameSetting = require("../../prototypes/game_setting.js");
const dom5SettingsData = require("../../../json/dom5_settings.json");
const domNationStore = require("../../../games/dominions_nation_store.js");
const dom5SettingFlags = require("../../../json/dominions5_setting_flags.json");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "aiNations";

module.exports = AiNations;

function AiNations(parentGameObject)
{
    let _value;
    const _parentGame = parentGameObject;
    const _gameType = _parentGame.getType();

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        let str = "";
        let aiNations = this.getValue();

        if (aiNations == null)
            return "None";

        Object.keys(aiNations).forEach((nationNbr, i) =>
        {
            let difficulty = aiNations[nationNbr];
            let nationObject = dom5NationStore.getNation(nationNbr);

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

        for (let nationNbr in value)
        {
            let nationDifficulty = value[nationNbr];

            if (Number.isInteger(+nationNbr) === false)
                throw new Error(`Expected string resolvable to integer; got ${nationNbr}`);

            if (typeof nationDifficulty !== "string")
                throw new Error(`Expected string; got ${nationDifficulty}`);
        }

        _value = value;
    };

    this.translateValueToCmdFlag = () =>
    {
        let flags = [];
        let aiNations = this.getValue();
    
        if (aiNations == null || Object.keys(aiNations).length <= 0)
            return flags;
    
        for (let nationNbr in aiNations)
        {
            let difficulty = aiNations[nationNbr];
    
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
        let aiNations = {};

        if (AiNations.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for AI nations.`);

        if (input.toLowerCase() === "none")
            return aiNations;

        input.split(",").forEach((aiNationStr) =>
        {
            let nationNbr = +aiNationStr.replace(/\D*/ig, "");
            let nationDifficulty = aiNationStr.replace(/\d*/ig, "").trim().toLowerCase();

            if (domNationStore.isValidNationIdentifierInEra(nationNbr, era, _gameType) === false)
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
AiNations.prototype = new GameSetting(key, dom5SettingsData[key]);
AiNations.prototype.constructor = AiNations;
