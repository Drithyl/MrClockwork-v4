const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");
const playerFileStore = require("../../../player_data/player_file_store.js");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("prune_data")
		.setDescription("[Dev-only] Prunes obsolete player data, like leftover game data or preferences from games."),

	execute: behaviour,

    // This command will never be deployed globally; only to a private dev guild
    isDev: true
};


async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsDev(commandContext);

    await commandContext.respondToCommand(new MessagePayload("Pruning obsolete data..."));
    await playerFileStore.clearObsoleteData();
    return commandContext.respondToCommand(new MessagePayload("Obsolete data pruned."));
}
