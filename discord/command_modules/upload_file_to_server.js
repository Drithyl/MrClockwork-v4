
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
    const googleDriveId = _extractGoogleDriveFileId(googleDriveLink);

    if (asserter.isValidGameType(gameType) === false)
        return commandContext.respondToCommand(new MessagePayload(`You must specify the game for which you want to get upload a file. Either ${config.dom5GameTypeName} or ${config.dom6GameTypeName}`));

    if (googleDriveId == null)
        return commandContext.respondToCommand(new MessagePayload("You must provide a shareable google drive link as the 2nd argument."));


    await commandContext.respondToCommand(new MessagePayload(`Sending request to server...`));
    await fileDownloader.downloadFileFromDrive(googleDriveId, gameType);
    await commandContext.respondToCommand(new MessagePayload(`Upload completed successfuly! Keep in mind that files that already existed on the server will **not** have been overwritten.`));
}


function _extractGoogleDriveFileId(id)
{
    const linkRegExp = new RegExp("^(https?:\\/\\/)?(drive.google.com)?(/file/d/)?(/drive/folders/)?(/open\\?id=)?([a-z0-9\\-_]+)(\\/?\\??.+)?", "i");

    if (asserter.isString(id) === false)
        return null;

    id = id.trim();

    if (linkRegExp.test(id) === true)
        return id.replace(linkRegExp, "$6");

    else return null;
}
