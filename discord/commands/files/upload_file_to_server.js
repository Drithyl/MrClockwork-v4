const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");
const fileDownloader = require("../../../downloader/file_downloader.js");
const asserter = require("../../../asserter.js");

const LINK_OPTION_NAME = "drive_link";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("upload")
		.setDescription("Upload map or mod to the server through google drive.")
        .addStringOption(option =>
            option.setName(LINK_OPTION_NAME)
            .setDescription("A google drive file ID or link, which must be shareable.")
        ),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsTrusted(commandContext);

    const googleDriveLink = commandContext.options.getString(LINK_OPTION_NAME);
    const googleDriveId = _extractGoogleDriveFileId(googleDriveLink);


    if (googleDriveId == null)
        return commandContext.respondToCommand(new MessagePayload("You must provide a shareable google drive link as the 2nd argument."));


    await commandContext.respondToCommand(new MessagePayload(`Sending request to server...`));
    await fileDownloader.downloadFileFromDrive(googleDriveId);
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
