
const assert = require("../../asserter.js");
const commandsData = require("../../json/commands_data.json");
const slashCommandsData = require("../../json/slash_commands_data.json");
const SemanticError = require("../../errors/custom_errors.js").SemanticError;

module.exports = CommandData;

function CommandData(commandName)
{
    const _data = (slashCommandsData[commandName] != null) ? slashCommandsData[commandName] : commandsData[commandName];

    try 
    {
        assert.isObjectOrThrow(_data);
    }

    catch(err) 
    {
        err.message = `Error with command key ${commandName}: ${err.message}`;
        throw err;
    }

    assert.isStringOrThrow(_data.name);
    assert.isBooleanOrThrow(_data.isEnabled);
    assert.isStringOrThrow(_data.description);
    assert.isStringOrThrow(_data.channelRequiredToInvoke);

    const _name = _data.name;
    const _isEnabled = _data.isEnabled;
    const _isDevOnly = _data.isDevOnly;
    const _gameTypesSupported = (_data.gameTypesSupported != null) ? _data.gameTypesSupported : [];
    const _channelRequiredToInvoke = _data.channelRequiredToInvoke;
    const _description = _data.description;
    const _argumentsRequiredInfo = [];
    const _argumentRegexpArray = [];

    if (assert.isArray(_data.options) === true)
    {
        _data.options.forEach((option) =>
        {
            _argumentsRequiredInfo.push(`TYPE: ${option.type} - ${option.description}`);
        });
    }

    if (assert.isArray(_data.argumentRegexpArray) === true)
    {
        _data.argumentRegexpArray.forEach((regexp) =>
        {
            _argumentRegexpArray.push(new RegExp(regexp, "i"));
        });
    }

    this.isEnabled = () => _isEnabled === true;
    this.isDevOnly = () => _isDevOnly === true;
    this.isGameTypeSupported = (gameType) => _gameTypesSupported.includes(gameType);
    
    this.getSlashCommandData = () => (this.isDevOnly() === false) ? Object.assign({}, _data) : null;
    this.getName = () => _name;
    this.getArgumentsRequiredInfo = () => _argumentsRequiredInfo;
    this.getArrayOfArgumentRegexp = () => [..._argumentRegexpArray];
    this.getChannelRequiredToInvoke = () => _channelRequiredToInvoke;
    this.getDescription = () => _description;
    this.areArgumentsRequired = () =>
    {
        if (assert.isArray(_data.options) === false)
            return false;
        
        _data.options.find((option) => option.required === true) != null;
    };

    this.validateArgumentsSentOrThrow = (commandContext) =>
    {
        var commandArguments = commandContext.getCommandArgumentsArray();

        if (_data.ignoreArgumentSpaces === true)
            commandArguments = [commandArguments.join()];

        for (var i = 0; i < commandArguments.length; i++)
        {
            var arg = commandArguments[i];
            var argRegexp = _argumentRegexpArray[i];

            if (argRegexp == null)
                continue;

            if (_isArgumentParsedByRegexp(arg, argRegexp) === false)
                return Promise.reject(new SemanticError(`Invalid argument <${arg}>. Expected to pass RegExp \`${argRegexp}\`.`));
        }
    };
}

function _isArgumentParsedByRegexp(arg, regexp)
{
    return regexp.test(arg) === true;
}