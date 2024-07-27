const cleaner = require("../../../cleaner.js");
const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const { getSizeInMB } = require("../../../utilities/file-utilities.js");


const MAPS_SUBCOMMAND_NAME = "maps";
const MODS_SUBCOMMAND_NAME = "mods";
const FORCE_OPTION_NAME = "force";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("clean")
		.setDescription("[Dev-only] Delete unused maps or mods.")

        .addSubcommand(subcommand =>
            subcommand.setName(MAPS_SUBCOMMAND_NAME)
            .setDescription("Delete unused maps.")
            .addBooleanOption(option =>
                option.setName(FORCE_OPTION_NAME)
                .setDescription("Do you really want to delete unused maps?")
            )
        )

        .addSubcommand(subcommand =>
            subcommand.setName(MODS_SUBCOMMAND_NAME)
            .setDescription("Delete unused mods.")
            .addBooleanOption(option =>
                option.setName(FORCE_OPTION_NAME)
                .setDescription("Do you really want to delete unused mods?")
            )
        ),

	execute: behaviour,

    // This command will never be deployed globally; only to a private dev guild
    isDev: true
};


async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsDev(commandContext);

    const subcommandName = commandContext.options.getSubcommand();
    const shouldDeleteFiles = commandContext.options.getBoolean(FORCE_OPTION_NAME);

    const results = await cleanUnusedFiles(subcommandName, shouldDeleteFiles);

    // Trim down results data if it gets over 8 MB, Discord's attachment limit
    if (getSizeInMB(results) >= 8) {
        delete results.existingFiles;
        delete results.unusedFiles;
    }

    if (getSizeInMB(results) >= 8) {
        delete results.deletedFiles;
    }

    if (getSizeInMB(results) >= 8) {
        delete results.usedFiles;
    }

    const payload = new MessagePayload(`A total of ${results.totalDeletedFiles} related files were deleted.`);
    payload.setAttachment("deleted_files.json", Buffer.from(JSON.stringify(results, null, 2), "utf8"));
    return commandContext.respondToCommand(payload);
}

function cleanUnusedFiles(commandName, shouldDeleteFiles)
{
    if (commandName === MAPS_SUBCOMMAND_NAME) {
        return cleaner.cleanUnusedMaps(shouldDeleteFiles);
    }

    else if (commandName === MODS_SUBCOMMAND_NAME) {
        return cleaner.cleanUnusedMods(shouldDeleteFiles);
    }

    else {
        throw new Error(`Could not find the right subcommand to execute; got ${commandName}`);
    }
}
