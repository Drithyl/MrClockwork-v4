
const GameSetting = require("../../prototypes/game_setting.js");
const ongoingGamesStore = require("../../../games/ongoing_games_store.js");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const _blacklistedNames = [
    "global",
    "newlords",
    "debug",
    "grep"
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
    
    this.canBeChangedAfterCreation = () => false;
    
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

        if (_blacklistedNames.includes(input.toLowerCase()) === true)
            throw new SemanticError(`This name is a blacklisted keyword.`);

        return input.toLowerCase();
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Name constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Name.prototype = new GameSetting(key);
Name.prototype.constructor = Name;
