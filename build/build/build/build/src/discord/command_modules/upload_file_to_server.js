"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var uploader = require("../../upload/uploader.js");
var commandData = new CommandData("UPLOAD_FILE_TO_SERVER");
module.exports = UploadFileToServerCommand;
function UploadFileToServerCommand() {
    var uploadFileToServerCommand = new Command(commandData);
    uploadFileToServerCommand.addBehaviour(_behaviour);
    uploadFileToServerCommand.addRequirements(commandPermissions.assertMemberIsTrusted);
    return uploadFileToServerCommand;
}
function _behaviour(commandContext) {
    var commandArgumentsArray = commandContext.getCommandArgumentsArray();
    var googleDriveLink = commandArgumentsArray[0];
    var nameOfServer = commandArgumentsArray[1];
    return uploader.uploadFileToServer(googleDriveLink, nameOfServer)
        .then(function () { return commandContext.respondToCommand("Your file has been uploaded."); });
}
//# sourceMappingURL=upload_file_to_server.js.map