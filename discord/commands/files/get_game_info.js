const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const MessagePayload = require("../../prototypes/message_payload.js");

const GAME_OPTION_NAME = "game_name";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("debug")
		.setDescription("[Game-organizer-only] Change game settings, provided the game hasn't started yet.")
        .addStringOption(option =>
            option.setName(GAME_OPTION_NAME)
            .setDescription("[Dev-only] Show current game's state.")
            .setRequired(true)
        ),

	execute: behaviour
};

async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);
    
    const targetedGame = commandContext.targetedGame;
    const settingsObject = targetedGame.getSettingsObject();
    const organizerWrapper = targetedGame.getOrganizer();

    let info = `IP: ${targetedGame.getIp()}:${targetedGame.getPort()}\nServer: ${targetedGame.getServer().getName()}\n\nOrganizer: `;

    if (organizerWrapper == null)
        info += "No organizer set";

    else info += organizerWrapper.getUsername();

    info += "\n" + settingsObject.getPublicSettingsStringList();

    return commandContext.respondToSender(new MessagePayload(info.toBox()));
}