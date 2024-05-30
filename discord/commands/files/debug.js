const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const ongoingGamesStore = require("../../../games/ongoing_games_store.js");

const GAME_NAME_OPTION = "game_name";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("debug")
		.setDescription("[Dev-only] Show current game's state")
        .addStringOption(option =>
            option.setName(GAME_NAME_OPTION)
            .setDescription("The name of the game on which to show debug info.")
            .setRequired(true)
            .setAutocomplete(true)
        ),

	execute: behaviour,
    autocomplete: autocompleteGameNames,

    // This command will never be deployed globally; only to a private dev guild
    isDev: true
};

async function behaviour(commandContext)
{
    commandPermissions.assertMemberIsDev(commandContext);
    const gameName = commandContext.options.getString(GAME_NAME_OPTION);

    let game;
    let debugInfo;
    

    if (ongoingGamesStore.hasOngoingGameByName(gameName) === false)
        return commandContext.respondToCommand(new MessagePayload(`No game found with this name.`));


    game = ongoingGamesStore.getOngoingGameByName(gameName);
    debugInfo = await game.debug();

    await commandContext.respondToCommand(
        new MessagePayload("Debug data attached:")
            .setAttachment(
                "debug.json",
                Buffer.from(
                    JSON.stringify(debugInfo, null, 2)
                )
            )
    );
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
