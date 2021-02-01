
const { text } = require("express");
const GameSetting = require("../../prototypes/game_setting.js");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "map";

module.exports = Map;

function Map(parentGameObject)
{
    var _value;
    const _parentGame = parentGameObject;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        return this.getValue();
    };
    
    this.setValue = (input) =>
    {
        const validatedValue = _validateInputFormatOrThrow(input);

        return _parentGame.emitPromiseToServer("VERIFY_MAP", validatedValue)
        .then(() => _value = validatedValue);
    };

    this.fromJSON = (value) =>
    {
        if (typeof value !== "string" || /.map$/i.test(value) === false)
            throw new Error(`Expected string ending with .map; got ${value}`);

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
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Map constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Map.prototype = new GameSetting(key);
Map.prototype.constructor = Map;
