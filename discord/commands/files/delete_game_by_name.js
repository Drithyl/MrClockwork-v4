const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const hostServerStore = require("../../../servers/host_server_store.js");
const ongoingGamesStore = require("../../../games/ongoing_games_store.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const log = require("../../../logger.js");


const GAME_NAME_OPTION = "game_name";
const DELETE_CHANNEL_OPTION = "delete_channel";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("delete_game_by_name")
		.setDescription("Permanently deletes a game by its name; useful when the channel no longer exists.")

        .addStringOption(option =>
            option.setName(GAME_NAME_OPTION)
            .setDescription("The name of the game to delete")
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addBooleanOption(option =>
            option.setName(DELETE_CHANNEL_OPTION)
            .setDescription("Do you want to keep the game's channel intact (if it still exists)?")
        ),

	execute: behaviour,
    autocomplete: autocompleteGameNames,

    // This command will never be deployed globally; only to a private dev guild
    isDev: true
};


async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsTrusted(commandContext);
    await commandPermissions.assertMemberIsOrganizer(commandContext);

    const gameName = commandContext.options.getString(GAME_NAME_OPTION);
    const shouldDeleteChannel = commandContext.options.getBoolean(DELETE_CHANNEL_OPTION);
    const gameObject = ongoingGamesStore.getOngoingGameByName(gameName);

    await commandContext.respondToCommand(new MessagePayload(`Deleting game...`));


    if (gameObject == null)
    {
        const servers = hostServerStore.getOnlineServers();
        const promises = servers.map((server) => server.emitPromise("DELETE_GAME", { 
            name: gameName 
        }, 130000));

        await Promise.allSettled(promises);
        await commandContext.respondToCommand(new MessagePayload(`${gameName} does not exist on master; sent message to online slaves to delete leftover files.`));
        log.general(log.getLeanLevel(), `${gameName} does not exist on master; sent message to online slaves to delete leftover files.`);
    }

    else
    {
        await gameObject.deleteGame();
        await gameObject.deleteRole();
        await commandContext.respondToCommand(new MessagePayload(`The game and its role were successfully deleted.`));

        if (shouldDeleteChannel === true)
        {
            await gameObject.deleteChannel();
            log.general(log.getLeanLevel(), `${gameObject.getName()}'s channel was deleted successfully.`);
        }
    }

    return commandContext.respondByDm(new MessagePayload(
        `${gameObject.getName()} was deleted successfully.`
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
