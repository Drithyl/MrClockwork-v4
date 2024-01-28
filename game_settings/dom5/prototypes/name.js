
const GameSetting = require("../../prototypes/game_setting.js");
const dom5SettingsData = require("../../../json/dom5_settings.json");
const ongoingGamesStore = require("../../../games/ongoing_games_store.js");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const _blacklistedPatterns = [
    /^global$/i,
    /^newlords$/i,
    /^debug$/i,
    /^grep$/i,
    /^rawsound$/i,
    /^doc$/i,
    /^key$/i,
    /^maps$/i,
    /^mods$/i,
    /^log$/i,
];

const key = "name";

module.exports = Name;

function Name()
{
    var _value;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        return this.getValue();
    };
    
    this.setValue = (input) =>
    {
        const validatedValue = _validateInputFormatOrThrow(input);

        if (ongoingGamesStore.isNameAvailable(validatedValue) === false)
            throw new SemanticError(`This name is already in use.`);

        _value = validatedValue;
    };

    this.fromJSON = (value) =>
    {
        if (typeof value !== "string")
            throw new Error(`Expected string; got ${value}`);

        _value = value;
    };

    this.translateValueToCmdFlag = () =>
    {
        var value = this.getValue();
    
        return [value];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (Name.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for the game's name.`);

        _blacklistedPatterns.forEach((regex) => 
        {
            if (regex.test(input) === true)
                throw new SemanticError(`This name is a blacklisted keyword.`);
        });

        return input.toLowerCase();
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Name constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Name.prototype = new GameSetting(key, dom5SettingsData[key]);
Name.prototype.constructor = Name;
