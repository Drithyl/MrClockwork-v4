

const assert = require("../../asserter.js");
const config = require("../../config/config.json");
const commandData = require("./command_data.js");

module.exports = DiscordCommand;

function DiscordCommand(commandDataObject)
{
    assert.isInstanceOfPrototype(commandDataObject, commandData);

    const _data = commandDataObject;

    var _requirementsArray = [];
    var _silentRequirementsArray = [];
    var _runCommand;

    this.isEnabled = () => _data.isEnabled();
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
        formatedHelp += `\`Arguments:\` `

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
        if (this.areSilentRequirementsMet(commandContext) === false)
            return Promise.resolve();

        return Promise.resolve(this.validateRequirementsOrThrow(commandContext))
        .then(() => _runCommand(commandContext));
    };

    this.areSilentRequirementsMet = (commandContext) =>
    {
        for (var i = 0; i < _silentRequirementsArray.length; i++)
        {
            var checkFn = _silentRequirementsArray[i];

            try
            {
                if (checkFn(commandContext) === false)
                {
                    console.log("Silent requirement not met!");
                    return false;
                }
                    
            }

            catch(err) 
            {
                console.log("Silent requirement not met!");
                return false;
            }
        }

        console.log("Silent requirements met!");
        return true;
    };

    this.validateRequirementsOrThrow = (commandContext) => 
    {
        _data.validateArgumentsSentOrThrow(commandContext);
        _validateRequirementsOrThrow(commandContext);
    };

    function _validateRequirementsOrThrow(commandContext)
    {
        for (var i = 0; i < _requirementsArray.length; i++)
        {
            var checkRequirementOrThrow = _requirementsArray[i];
            checkRequirementOrThrow(commandContext);
        }
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