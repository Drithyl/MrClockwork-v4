
const rw = require("../reader_writer.js");;
const RangeError = require("../errors/custom_errors.js").RangeError;
const commandFilesDirectoryPath = `${__dirname}/command_modules`;

const commandModuleFilenames = _getCommandModuleFilenamesAsArray();
const commandPrototypes = _getCommandPrototypesAsArray(commandModuleFilenames);
const commandStore = _getCommandObjectsAsArray(commandPrototypes);
console.log(commandModuleFilenames);
console.log(commandPrototypes);


exports.isCommandInvoked = (commandContext) =>
{
    for (var i = 0; i < commandStore.length; i++)
    {
        var command = commandStore[i];

        if (command.isInvoked(commandContext) === true)
        {
            console.log("Command was invoked!");
            return true;
        }
    }

    console.log("No command was found that matched the requirements.");
    return false;
};

exports.invokeCommand = (commandContext) =>
{
    for (var i = 0; i < commandStore.length; i++)
    {
        var command = commandStore[i];

        if (command.isInvoked(commandContext) === true)
            return command.invoke(commandContext);
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
    console.log("Populating command object array");

    commandPrototypesArray.forEach((CommandPrototype) =>
    {
        console.log("Created new command");
        arr.push(new CommandPrototype());
    });

    return arr;
}