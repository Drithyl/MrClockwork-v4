const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const MessagePayload = require("../../prototypes/message_payload.js");

const AP_OPTION = "ascension_points";


module.exports = {
	data: new SlashCommandBuilder()
		.setName("force_ap")
		.setDescription("For a started game, change the number of AP to win.")
        .addIntegerOption(option =>
            option.setName(AP_OPTION)
            .setDescription("Number of ascension points to set.")
            .setMinValue(1)
            .setRequired(true)
        )
        .setDMPermission(false),

	execute: behaviour
};

async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);
    await commandPermissions.assertGameHasStarted(commandContext);

    const game = commandContext.targetedGame;
    const ap = commandContext.options.getInteger(AP_OPTION);

    await game.forceApRequiredToWin(ap);
    return commandContext.respondWithGameAnnouncement(
        new MessagePayload(
            `The required Ascension Points to win has been set to ${ap}. The change will take effect after this turn ends, so if any nation has this many APs at that point, they will win the game.`
        )
    );
}
