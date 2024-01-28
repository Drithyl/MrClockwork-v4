
const GameSetting = require("../../prototypes/game_setting.js");
const dom5SettingsData = require("../../../json/dom5_settings.json");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "artifactForging";

module.exports = ArtifactForging;

function ArtifactForging()
{
    var _value;

    this.getValue = () => _value;
    this.getReadableValue = () => 
    {
        if (this.getValue() === true)
            return "Unlimited";

        else return "1/turn";
    };
    
    this.setValue = (input) =>
    {
        const validatedValue = _validateInputFormatOrThrow(input);

        _value = validatedValue;
    };

    this.fromJSON = (value, needsPatching = false) =>
    {
        if (needsPatching === true)
            value = _patchFromV3(value);
            
        if (typeof value !== "boolean")
            throw new Error(`artifactForging expected boolean; got ${value}`);

        _value = value;
    };

    this.translateValueToCmdFlag = () =>
    {
        var value = this.getValue();
    
        if (value === true)
            return ["--noartrest"];
    
        else return [];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (ArtifactForging.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for artifact forging.`);

        if (+input == 0)
            return false;

        else if (+input == 1)
            return true;

        else throw new SemanticError(`Unexpected value for the artifact forging: ${input}`);
    }

    function _patchFromV3(value)
    {
        if (+value == 1)
            return true;
        
        else return false;
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the ArtifactForging constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
ArtifactForging.prototype = new GameSetting(key, dom5SettingsData[key]);
ArtifactForging.prototype.constructor = ArtifactForging;
