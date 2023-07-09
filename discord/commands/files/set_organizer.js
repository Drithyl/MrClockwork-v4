const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");
const log = require("../../../logger.js");


const ORGANIZER_OPTION_NAME = "new_organizer";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("set_organizer")
		.setDescription("Sets a member as the organizer of this game. If an organizer exists; replaces them.")
        .addUserOption(option =>
            option.setName(ORGANIZER_OPTION_NAME)
            .setDescription("A mention to the new organizer (i.e. @Username#0000).")
            .setRequired(true)
        ),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);
    await commandPermissions.assertMemberIsOrganizer(commandContext);

    const gameObject = commandContext.targetedGame;
    const memberWrapper = await commandContext.fetchMemberWrapperOption(ORGANIZER_OPTION_NAME);

    gameObject.setOrganizer(memberWrapper);
    await gameObject.save();

    log.general(log.getLeanLevel(), `${gameObject.getName()}: new organizer ${memberWrapper.getUsername()} set.`);
    return commandContext.respondToCommand(new MessagePayload(
        `The new organizer is set.`
    ));
}
