const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");
const activeMenuStore = require("../../../menus/active_menu_store.js");
const hostServerStore = require("../../../servers/host_server_store.js");
const { SemanticError } = require("../../../errors/custom_errors.js");
const gameFactory = require("../../../games/game_factory.js");
const trustedServers = require("../../../config/trusted_server_data.json");


const SERVER_OPTION_NAME = "server_name";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("host")
		.setDescription("Host a Dom5 game. You will be asked a series of settings by DM to configure it.")
        .addStringOption(option =>
            option.setName(SERVER_OPTION_NAME)
            .setDescription("The name of th server on which to host the game.")
            .setRequired(true)
            .addChoices(...getStringOptionChoices())
        ),

	execute: behaviour
};


async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsTrusted(commandContext);
    assertHostingSpaceAvailable();

    const guildWrapper = commandContext.guildWrapper;
    const guildMemberWrapper = commandContext.memberWrapper;
    const selectedServerName = commandContext.options.getString(SERVER_OPTION_NAME);

    const selectedServer = hostServerStore.getHostServerByName(selectedServerName);

    if (selectedServer == null || selectedServer.isOnline() === false)
        return commandContext.respondToCommand(new MessagePayload(`You must specify a server name from the ones available below:\n\n${hostServerStore.printListOfOnlineHostServers().toBox()}`));

    const reservedPort = await selectedServer.reserveGameSlot();
    const newGameObject = gameFactory.createDominions5Game(reservedPort, selectedServer, guildWrapper, guildMemberWrapper);
    
    await commandContext.respondToCommand(new MessagePayload(`A DM was sent to you to host the game.`));
    await activeMenuStore.startHostGameMenu(newGameObject);
}

function assertHostingSpaceAvailable()
{
    let isThereSpace = hostServerStore.isThereHostingSpaceAvailable();

    if (isThereSpace === false)
        throw new SemanticError(`There are currently no available slots in any online server to host a game.`);
}

function getStringOptionChoices()
{
    const choices = [];

    for (let id in trustedServers)
    {
        const serverData = trustedServers[id];
        choices.push({ name: serverData.name, value: id });
    }

    return choices;
}