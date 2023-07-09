
const log = require("../../../logger.js");
const GameSetting = require("../../prototypes/game_setting.js");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "map";

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

        return _parentGame.emitPromiseToServer("VERIFY_MAP", validatedValue)
        .then(() => 
        {
            if (/\.map$/.test(validatedValue) === false)
                validatedValue += ".map";
                
            _value = validatedValue;
            log.general(log.getNormalLevel(), `${parentGameObject.getName()}: Changed setting ${this.getName()} to ${this.getReadableValue()}`);
        });
    };

    this.fromJSON = (value) =>
    {
        if (typeof value !== "string")
            throw new Error(`Expected string; got ${value}`);

        if (/.map$/i.test(value) === false)
            value += ".map";

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
Map.prototype = new GameSetting(key);
Map.prototype.constructor = Map;
