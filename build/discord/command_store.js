"use strict";
var rw = require("../reader_writer.js");
;
var RangeError = require("../errors/custom_errors.js").RangeError;
var commandFilesDirectoryPath = __dirname + "/command_modules";
var commandModuleFilenames = _getCommandModuleFilenamesAsArray();
var commandPrototypes = _getCommandPrototypesAsArray(commandModuleFilenames);
var commandStore = _getCommandObjectsAsArray(commandPrototypes);
console.log(commandModuleFilenames);
console.log(commandPrototypes);
exports.isCommandInvoked = function (commandContext) {
    for (var i = 0; i < commandStore.length; i++) {
        var command = commandStore[i];
        if (command.isInvoked(commandContext) === true) {
            console.log("Command was invoked!");
            return true;
        }
    }
    console.log("No command was found that matched the requirements.");
    return false;
};
exports.invokeCommand = function (commandContext) {
    for (var i = 0; i < commandStore.length; i++) {
        var command = commandStore[i];
        if (command.isInvoked(commandContext) === true)
            return command.invoke(commandContext);
    }
};
exports.getCommandByIndex = function (index) {
    if (commandStore[index] == null)
        throw new RangeError("No command found at index " + index + ".");
};
exports.forEachCommand = function (functionToApply) {
    commandStore.forEach(function (command, index) { return functionToApply(command, index); });
};
function _getCommandModuleFilenamesAsArray() {
    return rw.getOnlyDirFilenamesSync(commandFilesDirectoryPath);
}
function _getCommandPrototypesAsArray(filenamesAsArray) {
    var arr = [];
    filenamesAsArray.forEach(function (filename) {
        //Only include .js files
        if (/\.js$/.test(filename) === true)
            arr.push(require(commandFilesDirectoryPath + "/" + filename));
    });
    return arr;
}
function _getCommandObjectsAsArray(commandPrototypesArray) {
    var arr = [];
    console.log("Populating command object array");
    commandPrototypesArray.forEach(function (CommandPrototype) {
        console.log("Created new command");
        arr.push(new CommandPrototype());
    });
    return arr;
}
//# sourceMappingURL=command_store.js.map