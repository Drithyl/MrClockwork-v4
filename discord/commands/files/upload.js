
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
			.setRequired(true)
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
    const results = await fileDownloader.downloadFileFromDrive(googleDriveLink, gameType);

    if (results == null) {
        return await commandContext.respondToCommand(new MessagePayload(`Upload completed successfuly! Keep in mind that files that already existed on the server will **not** have been overwritten.`));
    }

    return commandContext.respondToCommand(parseResults(results));
}

function parseResults(results) {
    const resultsMessage = new MessagePayload('');
    const modsFullyInstalled = results.filter((modResult) => modResult.totalFiles === modResult.installedFiles.length).map((modResult) => modResult.modfile);
    const modsFullyRedundant = results.filter((modResult) => modResult.totalFiles === modResult.skippedFiles.length).map((modResult) => modResult.modfile);
    const modsPartiallyRedundant = results.filter((modResult) =>
            modResult.totalFiles > modResult.installedFiles.length && modResult.installedFiles.length > 0
        )
        .map((modResult) => modResult.modfile);

    if (results.length === 0) {
        resultsMessage.setHeader(`There were no mods to install in the uploaded file.`);
    }
    
    if (modsFullyInstalled.length === results.length) {
        resultsMessage.setHeader(`**All mods installed successfully**:\n${results.map((m) => `\n\t>\`${m.modfile}\``).join('')}`);
    }

    else if (modsFullyRedundant.length === results.length) {
        resultsMessage.setHeader(`All of the uploaded mods' versions already exist on the server. No file was installed.`);
    }

    else {
        // Some mods were fully installed
        if (modsFullyInstalled.length > 0) {
            resultsMessage.addContent(
                "**The following mods were installed successfully**:" +
                modsFullyInstalled.map((m) => `\n\t> \`${m}\``).join('') + "\n\n"
            );
        }

        // Some mods were fully redundant and none of their files was copied
        if (modsFullyRedundant.length > 0) {
            resultsMessage.addContent(
                "**The following mods already existed** with the same version on the server and were not installed:" +
                modsFullyRedundant.map((m) => `\n\t> \`${m}\``).join('') + "\n\n"
            );
        }

        // Some mods were only partially installed, i.e. some files were copied but others already existed
        if (modsPartiallyRedundant.length > 0) {
            const partiallyRedundantResults = results.filter((modResult) => modsPartiallyRedundant.includes(modResult.modfile));
            const stringifiedResults = JSON.stringify(partiallyRedundantResults.map((r) => {
                return { modfile: r.modfile, installedFiles: r.installedFiles };
            
            }), null, 2);

            resultsMessage.addContent(
                "**Some files in the following mods already existed**:" +
                modsPartiallyRedundant.map((m) => `\n\t> \`${m}\``).join('') + "\n\n" +
                "Check the attached file for details on which mods only had some files installed."
            );

            resultsMessage.setAttachment("installed_files.json", Buffer.from(stringifiedResults));
        }
    }

    return resultsMessage;
}
