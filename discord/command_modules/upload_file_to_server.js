
const asserter = require("../../asserter.js");
const config = require("../../config/config.json");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");
const fileDownloader = require("../../downloader/file_downloader.js");

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

async function _behaviour(commandContext)
{
    const commandArgumentsArray = commandContext.getCommandArgumentsArray();
    const gameType = commandArgumentsArray[0];
    const googleDriveLink = commandArgumentsArray[1];

    if (asserter.isValidGameType(gameType) === false)
        return commandContext.respondToCommand(new MessagePayload(`You must specify the game for which you want to get upload a file. Either ${config.dom5GameTypeName} or ${config.dom6GameTypeName}`));

    if (googleDriveLink == null)
        return commandContext.respondToCommand(new MessagePayload("You must provide a shareable google drive link as the 2nd argument."));


    await commandContext.respondToCommand(new MessagePayload(`Sending request to server...`));
    await fileDownloader.downloadFileFromDrive(googleDriveLink, gameType);
    await commandContext.respondToCommand(new MessagePayload(`Upload completed successfuly! Keep in mind that files that already existed on the server will **not** have been overwritten.`));
}
