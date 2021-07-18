
const GameSetting = require("../../prototypes/game_setting.js");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "disciples";

module.exports = Disciples;

function Disciples()
{
    var _value;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        var value = this.getValue();

        if (value == 0)
            return "false";

        if (value === 1)
            return "true";
        
        if (value === 2)
            return "true, clustered starts";

        else return "invalid value";
    };
    
    this.setValue = (input) =>
    {
        const validatedValue = _validateInputFormatOrThrow(input);

        _value = validatedValue;
    };

    this.fromJSON = (value) =>
    {
        if (Number.isInteger(+value) === false)
            throw new Error(`Expected integer; got ${+value}`);

        _value = +value;
    };

    this.translateValueToCmdFlag = () =>
    {
        var value = this.getValue();
    
        if (value == 1)
            return ["--teamgame"];
    
        else if (value == 2)
            return ["--teamgame", "--clustered"];
    
        else return [];
    };    

    function _validateInputFormatOrThrow(input)
    {
        if (Disciples.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for disciples.`);

        if (+input == 0 || +input == 1 || +input == 2)
            return +input;

        else throw new SemanticError(`Unexpected value for the artifact forging: ${input}`);
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the Disciples constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
Disciples.prototype = new GameSetting(key);
Disciples.prototype.constructor = Disciples;
