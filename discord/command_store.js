
const log = require("../logger.js");
const rw = require("../reader_writer.js");
const guildStore = require("./guild_store.js");
const RangeError = require("../errors/custom_errors.js").RangeError;
const commandFilesDirectoryPath = `${__dirname}/command_modules`;

const commandModuleFilenames = _getCommandModuleFilenamesAsArray();
const commandPrototypes = _getCommandPrototypesAsArray(commandModuleFilenames);
const commandStore = _getCommandObjectsAsArray(commandPrototypes);


exports.deployCommandIntegration = () =>
{
    return commandStore.forAllPromises((command) => command.getSlashCommandData())
    .then((bulkData) => guildStore.forAllGuilds((guildWrapper) => 
    {
        const filteredData = bulkData.filter((data) => data != null && Object.keys(data).length > 0);
        return guildWrapper.setCommands(filteredData)
        .then(() => log.general(log.getLeanLevel(), `Slash command integration deployed on guild ${guildWrapper.getName()}`));
    }));
};

exports.isCommandInvoked = (commandContext) =>
{
    for (var i = 0; i < commandStore.length; i++)
    {
        var command = commandStore[i];

        if (command.isInvoked(commandContext) === true)
        {
            log.general(log.getNormalLevel(), `Command ${command.getName()} was invoked!`);
            return true;
        }
    }

    log.general(log.getNormalLevel(), "No command was found that matched the requirements");
    return false;
};

exports.invokeCommand = (commandContext) =>
{
    for (var i = 0; i < commandStore.length; i++)
    {
        var command = commandStore[i];

        if (command.isInvoked(commandContext) === true)
            return command.invoke(commandContext)
            .catch((err) => Promise.reject(err));
    }
};

exports.invokeCommandInteraction = (commandInteractionWrapper) =>
{
    for (var i = 0; i < commandStore.length; i++)
    {
        var command = commandStore[i];

        if (command.isInvoked(commandContext) === true)
            return command.invoke(commandContext)
            .catch((err) => Promise.reject(err));
    }
};

exports.getCommandByIndex = (index) =>
{
    if (commandStore[index] == null)
        throw new RangeError(`No command found at index ${index}.`);
};

exports.forEachCommand = (functionToApply) =>
{
    commandStore.forEach((command, index) => functionToApply(command, index));
};

function _getCommandModuleFilenamesAsArray()
{
    return rw.getOnlyDirFilenamesSync(commandFilesDirectoryPath);
}

function _getCommandPrototypesAsArray(filenamesAsArray)
{
    var arr = [];

    filenamesAsArray.forEach((filename) =>
    {
        //Only include .js files
        if (/\.js$/.test(filename) === true)
            arr.push(require(`${commandFilesDirectoryPath}/${filename}`));
    });

    return arr;
}

function _getCommandObjectsAsArray(commandPrototypesArray)
{
    var arr = [];
    log.general(log.getNormalLevel(), "Populating command object array");

    commandPrototypesArray.forEach((CommandPrototype) =>
    {
        const commandObject = new CommandPrototype();
        arr.push(commandObject);
        log.general(log.getNormalLevel(), `Command object ${commandObject.getName()} created.`);
    });

    return arr;
}