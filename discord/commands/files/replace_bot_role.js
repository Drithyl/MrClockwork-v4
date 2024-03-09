const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");


const OLD_ROLE_OPTION_NAME = "id_of_old_role";
const NEW_ROLE_OPTION_NAME = "id_of_new_role";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("replace_bot_role")
		.setDescription("[Guild-owner-only] Replaces one of the bot roles by a different existing role.")
        .addRoleOption(option =>
            option.setName(OLD_ROLE_OPTION_NAME)
            .setDescription("The bot's role id to be replaced.")
            .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName(NEW_ROLE_OPTION_NAME)
            .setDescription("The new role's id to take its place.")
            .setRequired(true)
        ),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsGuildOwner(commandContext);

    const guildWrapper = commandContext.guildWrapper;
    const idOfRoleToBeReplaced = commandContext.options.getRole(OLD_ROLE_OPTION_NAME);
    const idOfRoleToTakeItsPlace = commandContext.options.getRole(NEW_ROLE_OPTION_NAME);

    await guildWrapper.replaceRoleWith(idOfRoleToBeReplaced, idOfRoleToTakeItsPlace);
    return commandContext.respondToCommand(new MessagePayload(`The role has been replaced.`));
}