"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++)
        s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var assert = require("../../asserter.js");
var config = require("../../config/config.json");
var commandsData = require("../../json/commands_data.json");
var SemanticError = require("../../errors/custom_errors.js").SemanticError;
module.exports = CommandData;
function CommandData(commandName) {
    try {
        assert.isObjectOrThrow(commandsData[commandName]);
    }
    catch (err) {
        err.message = "Error with command key " + commandName + ": " + err.message;
        throw err;
    }
    var _data = commandsData[commandName];
    assert.isStringOrThrow(_data.name);
    assert.isBooleanOrThrow(_data.isEnabled);
    assert.isArrayOrThrow(_data.gameTypesSupported);
    assert.isArrayOrThrow(_data.argumentsRequiredInfo);
    assert.isArrayOrThrow(_data.argumentRegexpArray);
    assert.isStringOrThrow(_data.regexpRequiredToInvoke);
    assert.isStringOrThrow(_data.channelRequiredToInvoke);
    assert.isStringOrThrow(_data.helpText);
    assert.isArrayOrThrow(_data.argumentRegexpArray);
    var _name = _data.name;
    var _isEnabled = _data.isEnabled;
    var _gameTypesSupported = _data.gameTypesSupported;
    var _argumentsRequiredInfo = _data.argumentsRequiredInfo;
    var _regexpRequiredToInvoke = new RegExp(config.commandPrefix + _data.regexpRequiredToInvoke, "i");
    var _channelRequiredToInvoke = _data.channelRequiredToInvoke;
    var _helpText = _data.helpText;
    var _argumentRegexpArray = [];
    _data.argumentRegexpArray.forEach(function (regexp) {
        _argumentRegexpArray.push(new RegExp(regexp, "i"));
    });
    this.isEnabled = function () { return _isEnabled; };
    this.isGameTypeSupported = function (gameType) { return _gameTypesSupported.includes(gameType); };
    this.getName = function () { return _name; };
    this.getArgumentsRequiredInfo = function () { return _argumentsRequiredInfo; };
    this.getRegexpRequiredToInvoke = function () { return _regexpRequiredToInvoke; };
    this.getArrayOfArgumentRegexp = function () { return __spreadArrays(_argumentRegexpArray); };
    this.getChannelRequiredToInvoke = function () { return _channelRequiredToInvoke; };
    this.getHelpText = function () { return _helpText; };
    this.validateArgumentsSentOrThrow = function (commandContext) {
        var commandArguments = commandContext.getCommandArgumentsArray();
        if (_data.ignoreArgumentSpaces === true)
            commandArguments = [commandArguments.join()];
        for (var i = 0; i < commandArguments.length; i++) {
            var arg = commandArguments[i];
            var argRegexp = _argumentRegexpArray[i];
            if (argRegexp == null)
                continue;
            if (_isArgumentParsedByRegexp(arg, argRegexp) === false)
                throw new SemanticError("Invalid argument <" + arg + ">. Expected to pass RegExp `" + argRegexp + "`.");
        }
    };
}
function _isArgumentParsedByRegexp(arg, regexp) {
    return regexp.test(arg) === true;
}
//# sourceMappingURL=command_data.js.map