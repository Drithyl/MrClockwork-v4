const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const ongoingGamesStore = require("../../../games/ongoing_games_store.js");
const MessagePayload = require("../../prototypes/message_payload.js");

const GAME_NAME_OPTION = "game_name";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("restablish_game")
		.setDescription("Reestablishes a game's deleted channel and/or role by creating new ones if none are found.")
        .addStringOption(option =>
            option.setName(GAME_NAME_OPTION)
            .setDescription("The name of the game that needs reestablished.")
            .setRequired(true)
            .setAutocomplete(true)
        ),

	execute: behaviour,
    autocomplete: autocompleteGameNames
};


async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsTrusted(commandContext);
    await commandPermissions.assertMemberIsGameMaster(commandContext);

    const guildWrapper = commandContext.guildWrapper;
    const gameName = commandContext.options.getString(GAME_NAME_OPTION);
    let gameObject;
    

    if (ongoingGamesStore.hasOngoingGameByName(gameName) === false)
        return commandContext.respondToCommand(new MessagePayload(`No game found with this name.`));

    gameObject = ongoingGamesStore.getOngoingGameByName(gameName);

    
    if (guildWrapper.findChannel(gameObject.getChannelId()) == null)
        await gameObject.createChannel();

    if (guildWrapper.findRole(gameObject.getRoleId()) == null)
        await gameObject.createRole();

    
    return commandContext.respondToCommand(new MessagePayload(
        `The game's channel and role have been restablished.`
    ));
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
