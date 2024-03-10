
const { SlashCommandBuilder } = require("discord.js");
const config = require("../../../config/config.json");
const commandPermissions = require("../../command_permissions.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const fileDownloader = require("../../../downloader/file_downloader.js");


const GAME_TYPE_OPTION = "game_type";
const LINK_OPTION_NAME = "drive_link";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("upload")
		.setDescription("Upload map or mod to the server through google drive.")
        .addStringOption(option =>
            option.setName(GAME_TYPE_OPTION)
            .setDescription("Whether to host a Dominions 5 or Dominions 6 game")
            .addChoices(
                { name: "Dominions 6", value: config.dom6GameTypeName },
                { name: "Dominions 5", value: config.dom5GameTypeName }
            )
			.setRequired(true)
        )
        .addStringOption(option =>
            option.setName(LINK_OPTION_NAME)
            .setDescription("A google drive file ID or link, which must be shareable.")
        )
        .setDMPermission(false),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsTrusted(commandContext);

    const gameType = commandContext.options.getString(GAME_TYPE_OPTION);
    const googleDriveLink = commandContext.options.getString(LINK_OPTION_NAME);

    if (googleDriveLink == null)
        return commandContext.respondToCommand(new MessagePayload("You must provide a shareable google drive link as the 2nd argument."));


    await commandContext.respondToCommand(new MessagePayload(`Sending request to server...`));
    await fileDownloader.downloadFileFromDrive(googleDriveLink, gameType);
    await commandContext.respondToCommand(new MessagePayload(`Upload completed successfuly! Keep in mind that files that already existed on the server will **not** have been overwritten.`));
}
