
const asserter = require("../../asserter.js");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");
const hostServerStore = require("../../servers/host_server_store.js");

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
    const uploadTimeoutMs = 600000;
    const commandArgumentsArray = commandContext.getCommandArgumentsArray();
    const fileType = commandArgumentsArray[0];

    const googleDriveLink = commandArgumentsArray[1];
    const googleDriveId = _extractGoogleDriveFileId(googleDriveLink);

    const nameOfServer  = commandArgumentsArray[2];
    const server = hostServerStore.getHostServerByName(nameOfServer);

    if (fileType == null)
        return commandContext.respondToCommand(new MessagePayload("You must specify a file type, `map` or `mod`, as the first argument."));

    if (googleDriveId == null)
        return commandContext.respondToCommand(new MessagePayload("You must provide a shareable google drive link as the 2nd argument."));


    if (server == null)
        return commandContext.respondToCommand(new MessagePayload(`You must specify as the 3rd argument a server name from the ones available below:\n\n${hostServerStore.printListOfOnlineHostServers().toBox()}`));


    return commandContext.respondToCommand(new MessagePayload(`Sending request to server...`))
    .then((statusMessage) => server.emitPromise("UPLOAD_FILE", { type: fileType, fileId: googleDriveId }, uploadTimeoutMs))
    .then((responseData) => 
    {
        const formattedData = _formatResponseData(responseData);
        const payload = new MessagePayload(`Find the details of your upload attached below:`);
        payload.setAttachment("uploaded_files.txt", Buffer.from(formattedData, "utf8"));

        return commandContext.respondToCommand(new MessagePayload(`Download complete! Details will be sent to your DMs.`))
        .then(() => commandContext.respondToSender(payload));
    });
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

function _formatResponseData(responseData)
{
    var formattedStr = "";
    const writtenEntries = responseData.writtenEntries;
    const skippedEntries = responseData.skippedEntries;

    if (asserter.isArray(writtenEntries) === false || asserter.isArray(skippedEntries) === false)
        return "No download details available, but the operation was either successful or skipped files that already existed.";

    if (writtenEntries.length <= 0)
        return "Files already existed on the server; none of them was written.";

    if (skippedEntries.length <= 0)
        return "All files were written successfully.";


    formattedStr = `Below are the files which were written. Those not listed were skipped, as they already existed.:\n\n\`\`\``;

    writtenEntries.forEach((filename) =>
    {
        if (/\/$/.test(filename) === true)
            formattedStr += `\n\n${filename}\n\n`;

        else formattedStr += `\t${filename}\n`;
    });

    return formattedStr + "```";
}