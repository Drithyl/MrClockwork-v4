
const log = require("../../logger.js");
const assert = require("../../asserter.js");
const config = require("../../config/config.json");
const commandData = require("./command_data.js");

module.exports = DiscordCommand;

function DiscordCommand(commandDataObject)
{
    assert.isInstanceOfPrototype(commandDataObject, commandData);

    const _command = this;
    const _data = commandDataObject;

    var _requirementsArray = [];
    var _silentRequirementsArray = [];
    var _runCommand;

    this.isEnabled = () => _data.isEnabled();
    this.isDevOnly = () => _data.isDevOnly();
    this.isGameTypeSupported = (...args) => _data.isGameTypeSupported(...args);

    this.getName = (...args) => _data.getName(...args);
    this.getArgumentsRequiredInfo = (...args) => _data.getArgumentsRequiredInfo(...args);
    this.getArrayOfArgumentRegexp = (...args) => _data.getArrayOfArgumentRegexp(...args);
    this.getRegexpRequiredToInvoke = (...args) => _data.getRegexpRequiredToInvoke(...args);
    this.getChannelRequiredToInvoke = (...args) => _data.getChannelRequiredToInvoke(...args);
    this.areArgumentsRequired = () => this.getArrayOfArgumentRegexp().length > 0;

    this.getHelpText = (...args) => _data.getHelpText(...args);
    this.getFormattedHelp = () =>
    {
        var helpString = this.getHelpText();
        var formatedHelp = `-------------------\n\n**${config.commandPrefix}${this.getName()}**\n\n${helpString}\n\n`;

        formatedHelp += `\`Where can it be used?:\` ${this.getChannelRequiredToInvoke()} channel\n\n`;
        formatedHelp += `\`Arguments:\` `;

        if (this.areArgumentsRequired() === false)
            formatedHelp += "No arguments required.\n";

        else
        {
            this.getArgumentsRequiredInfo().forEach((argInfo, index) =>
            {
                formatedHelp += `\n${index+1}. ${argInfo}\n`;
            });
        }

        return formatedHelp;
    };

    this.addBehaviour = (behaviourFn) =>
    {
        assert.isFunctionOrThrow(behaviourFn);
        _runCommand = behaviourFn;
    };

    this.addRequirements = (...requirements) =>
    {
        for (var i = 0; i < requirements.length; i++)
        {
            var requirementFn = requirements[i];

            assert.isFunctionOrThrow(requirementFn);
            _requirementsArray.push(requirementFn);
        }
    };

    this.addSilentRequirements = (...requirements) =>
    {
        for (var i = 0; i < requirements.length; i++)
        {
            var requirementFn = requirements[i];

            assert.isFunctionOrThrow(requirementFn);
            _silentRequirementsArray.push(requirementFn);
        }
    };

    this.isInvoked = (commandContext) => 
    {
        var commandString = commandContext.getCommandString();
        var commandRegexpToInvoke = this.getRegexpRequiredToInvoke();

        if (_isCommandUsedInValidChannel(commandContext) === false)
            return false;

        return commandRegexpToInvoke.test(commandString);
    };

    this.invoke = (commandContext) =>
    {
        return new Promise((resolve, reject) =>
        {
            _checkSilentRequirementsAreMet(commandContext)
            .then((areRequirementsMet) => 
            {
                //Silently stop command execution
                if (areRequirementsMet === false)
                    resolve();

                else
                    return _validateRequirementsOrThrow(commandContext);
            })
            .then(() => _runCommand(commandContext))
            .then(() => resolve())
            .catch((err) => reject(err));
        });
    };

    function _checkSilentRequirementsAreMet(commandContext)
    {
        if (_command.isDevOnly() === true && commandContext.isSenderDev() === false)
            return Promise.resolve(false);

        return _silentRequirementsArray.forEachPromise((requirementCheck, index, nextPromise) =>
        {
            //Wrap check in a promise, as some are sync and some are async
            return Promise.resolve(requirementCheck(commandContext))
            .then(() => nextPromise())
            .catch((err) => 
            {
                log.general(log.getNormalLevel(), `Command ${_command.getName()} silent requirements not met, check failed!`, requirementCheck, err.message);
                Promise.resolve(false);
            });
        })
        .then(() =>
        {
            log.general(log.getNormalLevel(), `Command ${_command.getName()} silent requirements met!`);
            return Promise.resolve(true);
        });
    }

    function _validateRequirementsOrThrow(commandContext)
    {
        return Promise.resolve(_data.validateArgumentsSentOrThrow(commandContext))
        .then(() =>
        {
            return _requirementsArray.forEachPromise((requirementCheck, index, nextPromise) =>
            {
                //Wrap check in a promise, as some are sync and some are async
                return Promise.resolve(requirementCheck(commandContext))
                .then(() => nextPromise())
                .catch((err) => Promise.reject(err));
            });
        });
    }

    function _isCommandUsedInValidChannel(commandContext)
    {
        var channelRequired = _data.getChannelRequiredToInvoke().toLowerCase();

        if (channelRequired === "dm" && commandContext.wasSentByDm() === true)
            return true;
            
        else if (channelRequired === "guild" && commandContext.wasSentByDm() === false)
            return true;

        else if (channelRequired === "game" && commandContext.isGameCommand() === true)
            return true;

        else if (channelRequired === "any")
            return true;
        
        else return false;
    }
}