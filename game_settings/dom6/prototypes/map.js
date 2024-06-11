
const log = require("../../../logger.js");
const config = require("../../../config/config.json");
const GameSetting = require("../../prototypes/game_setting.js");
const dom6SettingsData = require("../../../json/dom6_settings.json");
const { getDom6Mapfiles } = require("../../../servers/host_server_store.js");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;
const { appendDominionsMapExtension } = require("../../../helper_functions.js");

const key = "map";
const mapExtensionRegex = /\.map$/;

module.exports = Map;

function Map(parentGameObject)
{
    var _value;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        return this.getValue();
    };
    
    this.setValue = async (input) =>
    {
        let validatedValue = _validateInputFormatOrThrow(input);

        if (mapExtensionRegex.test(validatedValue) === false)
            validatedValue = appendDominionsMapExtension(validatedValue, config.dom6GameTypeName);

        await _checkIfMapExistsOrThrow(validatedValue);
            
        _value = validatedValue;
        log.general(log.getNormalLevel(), `${parentGameObject.getName()}: Changed setting ${this.getName()} to ${this.getReadableValue()}`);
    };

    this.fromJSON = (value) =>
    {
        if (typeof value !== "string")
            throw new Error(`Expected string; got ${value}`);

        if (mapExtensionRegex.test(value) === false)
            value = appendDominionsMapExtension(value, config.dom6GameTypeName);

        _value = value;
    };

    this.translateValueToCmdFlag = () =>
    {
        var value = this.getValue();
    
        return [`--mapfile`, value];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (Map.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for the map.`);

        return input;
    }

    async function _checkIfMapExistsOrThrow(filename)
    {
        const filepaths = await getDom6Mapfiles();
        const filenames = filepaths.map((mapfile) => mapfile.name);
        if (filenames.includes(filename) === false) {
            throw new Error(`The mapfile '${filename}' cannot be found. Make sure it's spelled correctly (capitalization matters)`);
        }
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Map constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Map.prototype = new GameSetting(key, dom6SettingsData[key]);
Map.prototype.constructor = Map;
