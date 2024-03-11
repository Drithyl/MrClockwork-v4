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
