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

    if (asserter.isValidGameType(gameType) === false)
        return commandContext.respondToCommand(new MessagePayload(`You must specify the game for which you want to get upload a file. Either ${config.dom5GameTypeName} or ${config.dom6GameTypeName}`));

    if (googleDriveLink == null)
        return commandContext.respondToCommand(new MessagePayload("You must provide a shareable google drive link as the 2nd argument."));


    await commandContext.respondToCommand(new MessagePayload(`Sending request to server...`));
    await fileDownloader.downloadFileFromDrive(googleDriveLink, gameType);
    await commandContext.respondToCommand(new MessagePayload(`Upload completed successfuly! Keep in mind that files that already existed on the server will **not** have been overwritten.`));
}
