const { SlashCommandBuilder } = require("discord.js");
const config = require("../../../config/config.json");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");
const activeMenuStore = require("../../../menus/active_menu_store.js");
const hostServerStore = require("../../../servers/host_server_store.js");
const { SemanticError } = require("../../../errors/custom_errors.js");
const gameFactory = require("../../../games/game_factory.js");
const trustedServers = require("../../../config/trusted_server_data.json");


const GAME_TYPE_OPTION = "game_type";
const SERVER_OPTION_NAME = "server_name";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("host")
		.setDescription("Host a Dominions game. You will be asked a series of settings by DM to configure it.")
        .addStringOption(option =>
            option.setName(GAME_TYPE_OPTION)
            .setDescription("Whether to host a Dominions 5 or Dominions 6 game")
            .addChoices(
                { name: "Dominions 6", value: config.dom6GameTypeName },
                { name: "Dominions 5", value: config.dom5GameTypeName }
            )
			.setRequired(true)
        )
        .addStringOption(option =>
            option.setName(SERVER_OPTION_NAME)
            .setDescription("The name of the server on which to host the game.")
            .setRequired(true)
            .addChoices(...getServerStringOptionChoices())
            .setRequired(true)
        ),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsTrusted(commandContext);
    assertHostingSpaceAvailable();

    const guildWrapper = commandContext.guildWrapper;
    const guildMemberWrapper = commandContext.memberWrapper;
    const gameType = commandContext.options.getString(GAME_TYPE_OPTION);
    const selectedServerId = commandContext.options.getString(SERVER_OPTION_NAME);

    const selectedServer = hostServerStore.getHostServerById(selectedServerId);

    if (selectedServer == null || selectedServer.isOnline() === false)
        return commandContext.respondToCommand(new MessagePayload(`You must specify a server name from the ones available below:\n\n${hostServerStore.printListOfOnlineHostServers().toBox()}`));

    const reservedPort = await selectedServer.reserveGameSlot();
    const newGameObject = gameFactory.createDominionsGame(reservedPort, selectedServer, guildWrapper, guildMemberWrapper, gameType);
    
    await commandContext.respondToCommand(new MessagePayload(`A DM was sent to you to host the game.`));
    await activeMenuStore.startHostGameMenu(newGameObject);
}

function assertHostingSpaceAvailable()
{
    let isThereSpace = hostServerStore.isThereHostingSpaceAvailable();

    if (isThereSpace === false)
        throw new SemanticError(`There are currently no available slots in any online server to host a game.`);
}

function getServerStringOptionChoices()
{
    const choices = [];

    for (let id in trustedServers)
    {
        const serverData = trustedServers[id];
        choices.push({ name: serverData.name, value: id });
    }

    return choices;
}
