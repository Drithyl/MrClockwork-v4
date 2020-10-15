
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const uploader = require("../../upload/uploader.js");

const commandData = new CommandData("UPLOAD_FILE_TO_SERVER");

module.exports = UploadFileToServerCommand;

function UploadFileToServerCommand()
{
    const uploadFileToServerCommand = new Command(commandData);

    uploadFileToServerCommand.addBehaviour(_behaviour);

    uploadFileToServerCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted
    );

    return uploadFileToServerCommand;
}

function _behaviour(commandContext)
{
    var commandArgumentsArray = commandContext.getCommandArgumentsArray();
    var googleDriveLink = commandArgumentsArray[0];
    var nameOfServer  = commandArgumentsArray[1];

    return uploader.uploadFileToServer(googleDriveLink, nameOfServer)
    .then(() => commandContext.respondToCommand(`Your file has been uploaded.`));
}