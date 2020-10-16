
const assert = require("../../asserter.js");
const config = require("../../config/config.json");
const commandsData = require("../../json/commands_data.json");
const SemanticError = require("../../errors/custom_errors.js").SemanticError;

module.exports = CommandData;

function CommandData(commandName)
{
  try 
  {
    assert.isObjectOrThrow(commandsData[commandName]);
  }

  catch(err) 
  {
    err.message = `Error with command key ${commandName}: ${err.message}`;
    throw err;
  }

  const _data = commandsData[commandName];

  assert.isStringOrThrow(_data.name);
  assert.isBooleanOrThrow(_data.isEnabled);
  assert.isArrayOrThrow(_data.gameTypesSupported);
  assert.isArrayOrThrow(_data.argumentsRequiredInfo);
  assert.isArrayOrThrow(_data.argumentRegexpArray);
  assert.isStringOrThrow(_data.regexpRequiredToInvoke);
  assert.isStringOrThrow(_data.channelRequiredToInvoke);
  assert.isStringOrThrow(_data.helpText);
  assert.isArrayOrThrow(_data.argumentRegexpArray);

  const _name = _data.name;
  const _isEnabled = _data.isEnabled;
  const _gameTypesSupported = _data.gameTypesSupported;
  const _argumentsRequiredInfo = _data.argumentsRequiredInfo;
  const _regexpRequiredToInvoke = new RegExp(config.commandPrefix + _data.regexpRequiredToInvoke, "i");
  const _channelRequiredToInvoke = _data.channelRequiredToInvoke;
  const _helpText = _data.helpText;
  const _argumentRegexpArray = [];

  _data.argumentRegexpArray.forEach((regexp) =>
  {
    _argumentRegexpArray.push(new RegExp(regexp, "i"));
  });

  this.isEnabled = () => _isEnabled;
  this.isGameTypeSupported = (gameType) => _gameTypesSupported.includes(gameType);
  
  this.getName = () => _name;
  this.getArgumentsRequiredInfo = () => _argumentsRequiredInfo;
  this.getRegexpRequiredToInvoke = () => _regexpRequiredToInvoke;
  this.getArrayOfArgumentRegexp = () => [..._argumentRegexpArray];
  this.getChannelRequiredToInvoke = () => _channelRequiredToInvoke;
  this.getHelpText = () => _helpText;

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
        throw new SemanticError(`Invalid argument <${arg}>. Expected to pass RegExp \`${argRegexp}\`.`);
    }
  };
}

function _isArgumentParsedByRegexp(arg, regexp)
{
  return regexp.test(arg) === true;
}