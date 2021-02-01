
const GameSetting = require("../../prototypes/game_setting.js");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "masterPassword";

module.exports = MasterPassword;

function MasterPassword()
{
    var _value;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        return this.getValue();
    };

    this.isPublic = () => false;
    this.canBeChangedAfterCreation = () => false;
    
    this.setValue = (input) =>
    {
        const validatedValue = _validateInputFormatOrThrow(input);

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
    
        return [`--masterpass`, value];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (MasterPassword.prototype.isExpectedFormat(input) === input)
            throw new SemanticError(`Invalid value format for the master password.`);

        return input;
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the MasterPassword constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
MasterPassword.prototype = new GameSetting(key);
MasterPassword.prototype.constructor = MasterPassword;
