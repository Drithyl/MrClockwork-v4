
const log = require("../../../logger.js");
const config = require("../../../config/config.json");
const GameSetting = require("../../prototypes/game_setting.js");
const dom5SettingsData = require("../../../json/dom5_settings.json");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;
const { appendDominionsMapExtension } = require("../../../helper_functions.js");

const key = "map";
const mapExtensionRegex = /\.map$/;

module.exports = Map;

function Map(parentGameObject)
{
    let _value;
    const _parentGame = parentGameObject;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        return this.getValue();
    };
    
    this.setValue = (input) =>
    {
        let validatedValue = _validateInputFormatOrThrow(input);

        return _parentGame.emitPromiseToServer("VERIFY_MAP", { filename: validatedValue, gameType: config.dom5GameTypeName })
        .then(() => 
        {
            if (mapExtensionRegex.test(validatedValue) === false)
                validatedValue = appendDominionsMapExtension(validatedValue, config.dom5GameTypeName);
                
            _value = validatedValue;
            log.general(log.getNormalLevel(), `${parentGameObject.getName()}: Changed setting ${this.getName()} to ${this.getReadableValue()}`);
        });
    };

    this.fromJSON = (value) =>
    {
        if (typeof value !== "string")
            throw new Error(`Expected string; got ${value}`);

        if (mapExtensionRegex.test(value) === false)
            value = appendDominionsMapExtension(value, config.dom5GameTypeName);

        _value = value;
    };

    this.translateValueToCmdFlag = () =>
    {
        let value = this.getValue();
    
        return [`--mapfile`, value];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (Map.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for the map.`);

        return input;
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Map constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Map.prototype = new GameSetting(key, dom5SettingsData[key]);
Map.prototype.constructor = Map;
