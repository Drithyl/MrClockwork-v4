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
    // Returns the value of the option currently
    // being focused by the user. "true" makes it
    // return the whole focused object instead of
    // its string value. This way we can access the
    // name of the focused value as well.
    const focusedOption = autocompleteContext.options.getFocused(true);
    const games = ongoingGamesStore.getArrayOfGames();

    let choices = [];

    if (focusedOption.name === GAME_NAME_OPTION)
    {
        // Array of choices that are available to select
        choices = games.map((game) => {
            let name = game.getName();

            if (name.length > 25) {
                name = name.slice(0, 22) + "...";
            }

            return name;
        });
    }

    // Filter choices based on our focused value
    const filtered = choices.filter(choice =>
        choice.toLowerCase().includes(focusedOption.value)
    );

    // Respond with the list of choices that match
    // the focused value, like an autocomplete
    await autocompleteContext.respond(
        filtered.map(choice => ({ name: choice, value: choice })),
    );
}
