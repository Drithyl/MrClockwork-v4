const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const activeMenuStore = require("../../../menus/active_menu_store.js");
const MessagePayload = require("../../prototypes/message_payload.js");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("settings")
		.setDescription("[Game-organizer-only] Change game settings, provided the game hasn't started yet.")
        .setDMPermission(false),

	execute: behaviour
};

async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);
    await commandPermissions.assertServerIsOnline(commandContext);
    await commandPermissions.assertMemberIsTrusted(commandContext);
    await commandPermissions.assertMemberIsOrganizer(commandContext);
    await commandPermissions.assertGameHasNotStarted(commandContext);

    await commandContext.respondToCommand(
        new MessagePayload(`A DM was sent to you to change your settings.`)
    );

    activeMenuStore.startChangeSettingsMenu(commandContext);
}
