
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

    let _requirementsArray = [];
    let _silentRequirementsArray = [];
    let _runCommand;

    this.isEnabled = () => _data.isEnabled();
    this.isDevOnly = () => _data.isDevOnly();
    this.isGameTypeSupported = (...args) => _data.isGameTypeSupported(...args);

    this.getName = (...args) => _data.getName(...args);
    this.getArgumentsRequiredInfo = (...args) => _data.getArgumentsRequiredInfo(...args);
    this.getArrayOfArgumentRegexp = (...args) => _data.getArrayOfArgumentRegexp(...args);
    this.getRegexpRequiredToInvoke = (...args) => _data.getRegexpRequiredToInvoke(...args);
    this.getSlashRegexpRequiredToInvoke = (...args) => _data.getSlashRegexpRequiredToInvoke(...args);
    this.getChannelRequiredToInvoke = (...args) => _data.getChannelRequiredToInvoke(...args);
    this.areArgumentsRequired = () => _data.areArgumentsRequired();
    this.getSlashCommandData = () => _data.getSlashCommandData();

    this.getDescription = (...args) => _data.getDescription(...args);
    this.getFormattedHelp = () =>
    {
        let helpString = this.getDescription();
        let formatedHelp = `-------------------\n\n**${config.commandPrefix}${this.getName()}**\n\n${helpString}\n\n`;

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
        for (let i = 0; i < requirements.length; i++)
        {
            let requirementFn = requirements[i];

            assert.isFunctionOrThrow(requirementFn);
            _requirementsArray.push(requirementFn);
        }
    };

    this.addSilentRequirements = (...requirements) =>
    {
        for (let i = 0; i < requirements.length; i++)
        {
            let requirementFn = requirements[i];

            assert.isFunctionOrThrow(requirementFn);
            _silentRequirementsArray.push(requirementFn);
        }
    };

    this.isInvoked = (commandContext) => 
    {
        const commandString = commandContext.getCommandString();
        const isSlashCommand = (commandContext.isCommandInteraction != null) ? commandContext.isCommandInteraction() : false;
        const regexp = (isSlashCommand === true) ? this.getSlashRegexpRequiredToInvoke() : this.getRegexpRequiredToInvoke();

        if (_isCommandUsedInValidChannel(commandContext) === false)
            return false;

        return regexp.test(commandString);
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
                    return resolve(log.general(log.getNormalLevel(), `Silent requirements not met`));


                _validateRequirementsOrThrow(commandContext)
                .then(() => _runCommand(commandContext))
                .then(() => resolve())
                .catch((err) => reject(err));
            });
        });
    };

    function _checkSilentRequirementsAreMet(commandContext)
    {
        if (_command.isDevOnly() === true && commandContext.isSenderDev() === false)
        {
            log.general(log.getVerboseLevel(), `This is a dev-only command; user is not a dev`);
            return Promise.resolve(false);
        }

        if (_silentRequirementsArray.length <= 0)
            return Promise.resolve(true);

        return _silentRequirementsArray.forEachPromise((requirementCheck, index, nextPromise) =>
        {
            //Wrap check in a promise, as some are sync and some are async
            return Promise.resolve(requirementCheck(commandContext))
            .then(() => nextPromise())
            .catch((err) => 
            {
                log.general(log.getNormalLevel(), `Command ${_command.getName()} silent requirements not met`, requirementCheck, err.message);
                Promise.resolve(false);
            });
        })
        .then(() =>
        {
            log.general(log.getNormalLevel(), `Command ${_command.getName()} silent requirements met`);
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
        let channelRequired = _data.getChannelRequiredToInvoke().toLowerCase();

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