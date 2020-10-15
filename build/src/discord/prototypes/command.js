"use strict";
var assert = require("../../asserter.js");
var config = require("../../config/config.json");
var commandData = require("./command_data.js");
module.exports = DiscordCommand;
function DiscordCommand(commandDataObject) {
    var _this = this;
    assert.isInstanceOfPrototype(commandDataObject, commandData);
    var _data = commandDataObject;
    var _requirementsArray = [];
    var _silentRequirementsArray = [];
    var _runCommand;
    this.isEnabled = function () { return _data.isEnabled(); };
    this.isGameTypeSupported = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _data.isGameTypeSupported.apply(_data, args);
    };
    this.getName = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _data.getName.apply(_data, args);
    };
    this.getArgumentsRequiredInfo = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _data.getArgumentsRequiredInfo.apply(_data, args);
    };
    this.getArrayOfArgumentRegexp = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _data.getArrayOfArgumentRegexp.apply(_data, args);
    };
    this.getRegexpRequiredToInvoke = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _data.getRegexpRequiredToInvoke.apply(_data, args);
    };
    this.getChannelRequiredToInvoke = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _data.getChannelRequiredToInvoke.apply(_data, args);
    };
    this.areArgumentsRequired = function () { return _this.getArrayOfArgumentRegexp().length > 0; };
    this.getHelpText = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _data.getHelpText.apply(_data, args);
    };
    this.getFormattedHelp = function () {
        var helpString = _this.getHelpText();
        var formatedHelp = "-------------------\n\n**" + config.commandPrefix + _this.getName() + "**\n\n" + helpString + "\n\n";
        formatedHelp += "`Where can it be used?:` " + _this.getChannelRequiredToInvoke() + " channel\n\n";
        formatedHelp += "`Arguments:` ";
        if (_this.areArgumentsRequired() === false)
            formatedHelp += "No arguments required.\n";
        else {
            _this.getArgumentsRequiredInfo().forEach(function (argInfo, index) {
                formatedHelp += "\n" + (index + 1) + ". " + argInfo + "\n";
            });
        }
        return formatedHelp;
    };
    this.addBehaviour = function (behaviourFn) {
        assert.isFunctionOrThrow(behaviourFn);
        _runCommand = behaviourFn;
    };
    this.addRequirements = function () {
        var requirements = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            requirements[_i] = arguments[_i];
        }
        for (var i = 0; i < requirements.length; i++) {
            var requirementFn = requirements[i];
            assert.isFunctionOrThrow(requirementFn);
            _requirementsArray.push(requirementFn);
        }
    };
    this.addSilentRequirements = function () {
        var requirements = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            requirements[_i] = arguments[_i];
        }
        for (var i = 0; i < requirements.length; i++) {
            var requirementFn = requirements[i];
            assert.isFunctionOrThrow(requirementFn);
            _silentRequirementsArray.push(requirementFn);
        }
    };
    this.isInvoked = function (commandContext) {
        var commandString = commandContext.getCommandString();
        var commandRegexpToInvoke = _this.getRegexpRequiredToInvoke();
        if (_isCommandUsedInValidChannel(commandContext) === false)
            return false;
        return commandRegexpToInvoke.test(commandString);
    };
    this.invoke = function (commandContext) {
        if (_this.areSilentRequirementsMet(commandContext) === false)
            return Promise.resolve();
        return Promise.resolve(_this.validateRequirementsOrThrow(commandContext))
            .then(function () { return _runCommand(commandContext); });
    };
    this.areSilentRequirementsMet = function (commandContext) {
        for (var i = 0; i < _silentRequirementsArray.length; i++) {
            var checkFn = _silentRequirementsArray[i];
            try {
                if (checkFn(commandContext) === false) {
                    console.log("Silent requirement not met!");
                    return false;
                }
            }
            catch (err) {
                console.log("Silent requirement not met!");
                return false;
            }
        }
        console.log("Silent requirements met!");
        return true;
    };
    this.validateRequirementsOrThrow = function (commandContext) {
        _data.validateArgumentsSentOrThrow(commandContext);
        _validateRequirementsOrThrow(commandContext);
    };
    function _validateRequirementsOrThrow(commandContext) {
        for (var i = 0; i < _requirementsArray.length; i++) {
            var checkRequirementOrThrow = _requirementsArray[i];
            checkRequirementOrThrow(commandContext);
        }
    }
    function _isCommandUsedInValidChannel(commandContext) {
        var channelRequired = _data.getChannelRequiredToInvoke().toLowerCase();
        if (channelRequired === "dm" && commandContext.wasSentByDm() === true)
            return true;
        else if (channelRequired === "guild" && commandContext.wasSentByDm() === false)
            return true;
        else if (channelRequired === "game" && commandContext.isGameCommand() === true)
            return true;
        else if (channelRequired === "any")
            return true;
        else
            return false;
    }
}
//# sourceMappingURL=command.js.map