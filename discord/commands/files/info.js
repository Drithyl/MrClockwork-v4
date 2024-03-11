const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const ongoingGamesStore = require("../../../games/ongoing_games_store.js");

const GAME_NAME_OPTION = "game_name";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("info")
		.setDescription("Prints this game's information and settings.")
        .addStringOption(option =>
            option.setName(GAME_NAME_OPTION)
            .setDescription("The name of the game on which to show info.")
            .setRequired(true)
            .setAutocomplete(true)
        ),

	execute: behaviour,
    autocomplete: autocompleteGameNames
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

async function autocompleteGameNames(autocompleteContext)
{
    const games = ongoingGamesStore.getArrayOfGames();

    // Array of choices that are available to select
    const choices = games.map((game) => {
        const name = game.getName();
        return { name: name, value: name };
    });

    // Respond with the list of choices that match
    // the focused value, like an autocomplete
    await autocompleteContext.autocomplete(choices);
}
