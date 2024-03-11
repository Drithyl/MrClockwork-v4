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
    await commandPermissions.assertMemberIsDev(commandContext);(commandContext);

    const gameName = commandContext.options.getString(GAME_NAME_OPTION);
    const payload = new MessagePayload("Below is the game's state:");

    let game;
    let status;
    let nations;
    let debugInfo;
    

    if (ongoingGamesStore.hasOngoingGameByName(gameName) === false)
        return commandContext.respondToCommand(new MessagePayload(`No game found with this name.`));


    game = ongoingGamesStore.getOngoingGameByName(gameName);
    status = game.getLastKnownStatus();

    await commandContext.respondToCommand(new MessagePayload(`Getting info...`));

    nations = await game.fetchSubmittedNations();

    debugInfo = {
        guild: `${game.getGuild()?.getName()} (${game.getGuildId()})`,
        organizer: `${game.getOrganizer()?.getNameInGuild()} (${game.getOrganizerId()})`,
        channel: `${game.getChannel()?.name} (${game.getChannelId()})`,
        role: `${game.getRole()?.name} (${game.getRoleId()})`,
        server: game.getServer()?.getName(),
        address: `${game.getIp()}:${game.getPort()}`,
        statusEmbed: game.getStatusEmbedId(),
        status: {
            isServerOnline: game.isServerOnline(),
            isOnline: status.isOnline(),
            hasStarted: status.hasStarted(),
            isCurrentTurnRollback: status.isCurrentTurnRollback(),
            isTurnProcessing: status.isTurnProcessing(),
            areAllTurnsDone: status.areAllTurnsDone(),
            isPaused: status.isPaused(),
            turnNumber: status.getTurnNumber(),
            msLeft: status.getMsLeft(),
            successfulCheckTimestamp: status.getSuccessfulCheckTimestamp(),
            lastUpdateTimestamp: status.getLastUpdateTimestamp(),
            lastTurnTimestamp: status.getLastTurnTimestamp(),
            players: status.getPlayers()
        },
        
        settings: game.getSettingsObject(),
        nations
    };

    payload.setAttachment("state.json", Buffer.from(JSON.stringify(debugInfo, null, 2)));
    await commandContext.respondByDm(payload);
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
