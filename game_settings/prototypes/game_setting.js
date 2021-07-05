
const assert = require("../../asserter.js");
const dom5SettingsData = require("../../json/dom5_settings.json");

module.exports = GameSetting;

function GameSetting(key)
{
    const data = dom5SettingsData[key];
    assert.isObjectOrThrow(data);
        
    const _key = key;
    const _name = data.name;
    const _description = data.description;
    const _defaultValue = data.defaultInput;
    const _canBeChanged = data.canBeChanged;
    const _isPublic = data.isPublic;
    const _expectedInputFormatRegexp = new RegExp(data.expectedInputFormatRegexp, "i");

    this.getKey = () => _key;
    this.getName = () => _name;
    this.getDefault = () => _defaultValue;
    this.getDescription = () => _description;
    this.getParseRegexp = () => _regexp;
    this.getPrompt = () => `**${this.getName()}:**\n\n${this.getDescription()}`;

    this.canBeChanged = () => _canBeChanged;
    this.isPublic = () => _isPublic;

    this.isExpectedFormat = (inputStr) => 
    {
        if (assert.isString(inputStr) === false)
            return false;

        else return _expectedInputFormatRegexp.test(inputStr)
    };
}

GameSetting.prototype.getPrompt = () => "No prompt behaviour defined.";
this.translateValueToCmdFlag = () => "No cmd flag defined.";