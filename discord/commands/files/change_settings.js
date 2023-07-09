const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const activeMenuStore = require("../../../menus/active_menu_store.js");
const MessagePayload = require("../../prototypes/message_payload.js");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("settings")
		.setDescription("[Game-organizer-only] Change game settings, provided the game hasn't started yet."),

	execute: behaviour
};

async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);(commandContext);
    await commandPermissions.assertServerIsOnline(commandContext);(commandContext);
    await commandPermissions.assertMemberIsTrusted(commandContext);(commandContext);
    await commandPermissions.assertMemberIsOrganizer(commandContext);(commandContext);
    await commandPermissions.assertGameHasNotStarted(commandContext);(commandContext);

    await commandContext.respondToCommand(
        new MessagePayload(`A DM was sent to you to change your settings.`)
    );

    activeMenuStore.startChangeSettingsMenu(commandContext);
}