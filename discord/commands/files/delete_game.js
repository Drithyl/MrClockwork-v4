const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const log = require("../../../logger.js");


const DELETE_CHANNEL_OPTION = "delete_channel";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("delete_game")
		.setDescription("Permanently deletes the game hosted in this channel.")

        .addBooleanOption(option =>
            option.setName(DELETE_CHANNEL_OPTION)
            .setDescription("Set to False if you would like to keep the game's channel.")
            .setRequired(true)
        )
        .setDMPermission(false),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsTrusted(commandContext);
    await commandPermissions.assertMemberIsOrganizer(commandContext);
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);

    const gameObject = commandContext.targetedGame;
    const shouldDeleteChannel = commandContext.options.getBoolean(DELETE_CHANNEL_OPTION);

    await commandContext.respondToCommand(new MessagePayload(`Deleting game...`));

    await gameObject.deleteRole();
    await gameObject.deleteGame();
    log.general(log.getLeanLevel(), `${gameObject.getName()} and its role were deleted successfully.`);

    if (shouldDeleteChannel === true) {
        await gameObject.deleteChannel();
        log.general(log.getLeanLevel(), `${gameObject.getName()}'s channel was deleted successfully.`);
        return commandContext.respondByDm(new MessagePayload(
            `${gameObject.getName()} was deleted successfully.`
        ));
    }

    else {
        await commandContext.respondToCommand(new MessagePayload(`The game has been deleted successfully.`));
    }
}
