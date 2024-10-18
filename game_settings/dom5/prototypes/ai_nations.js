
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

        Object.keys(aiNations).forEach((nationNumber, i) =>
        {
            let difficulty = aiNations[nationNumber];
            let nationObject = domNationStore.getNation(nationNumber, _gameType);

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

        for (let nationNumber in value)
        {
            let nationDifficulty = value[nationNumber];

            if (Number.isInteger(+nationNumber) === false)
                throw new Error(`Expected string resolvable to integer; got ${nationNumber}`);

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
    
        for (let nationNumber in aiNations)
        {
            let difficulty = aiNations[nationNumber];
    
            if (difficulty === dom5SettingFlags.EASY_AI)
                flags.push(`--easyai`, nationNumber);
    
            else if (difficulty === dom5SettingFlags.NORMAL_AI)
                flags.push(`--normai`, nationNumber);
    
            else if (difficulty === dom5SettingFlags.DIFFICULT_AI)
                flags.push(`--diffai`, nationNumber);
    
            else if (difficulty === dom5SettingFlags.MIGHTY_AI)
                flags.push(`--mightyai`, nationNumber);
    
            else if (difficulty === dom5SettingFlags.MASTER_AI)
                flags.push(`--masterai`, nationNumber);
    
            else if (difficulty === dom5SettingFlags.IMPOSSIBLE_AI)
                flags.push(`--impai`, nationNumber);
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
            let nationNumber = +aiNationStr.replace(/\D*/ig, "");
            let nationDifficulty = aiNationStr.replace(/\d*/ig, "").trim().toLowerCase();

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
AiNations.prototype = new GameSetting(key, dom5SettingsData[key]);
AiNations.prototype.constructor = AiNations;
