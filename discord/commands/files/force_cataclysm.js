const config = require("../../../config/config.json");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const { EMBED_COLOURS } = require("../../../constants/discord-constants.js");
const { DOOM_ICON } = require("../../../constants/discord-constants.js");
const { dateToUnixTimestamp, unixTimestampToDynamicDisplay } = require("../../../utilities/formatting-utilities.js");

const CATACLYSM_TURN = "cataclysm_turn";


module.exports = {
	data: new SlashCommandBuilder()
		.setName("force_cataclysm")
		.setDescription("For a started game, change turn at which the cataclysm will begin.")
        .addIntegerOption(option =>
            option.setName(CATACLYSM_TURN)
            .setDescription("The turn where the Cataclysm will begin.")
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
    const status = game.getLastKnownStatus();
    const currentTurn = status.getTurnNumber();
    const cataclysmTurn = commandContext.options.getInteger(CATACLYSM_TURN);
    
    await game.forceCataclysmTurnNumber(cataclysmTurn);

    if (cataclysmTurn <= currentTurn + 1) {
        const timeLeft = status.getTimeLeft();
        const dateWhenTurnWillRoll = timeLeft.toDateObject();
        const unixTimestamp = dateToUnixTimestamp(dateWhenTurnWillRoll);

        return commandContext.respondWithGameAnnouncement(
            new MessagePayload()
            .addEmbeds(
                new EmbedBuilder()
                    .setColor(EMBED_COLOURS.DOOM)
                    .setAuthor({ name: `IMPENDING DOOM...`, iconURL: `${config.fullSecureUrl}/img/dominions/${DOOM_ICON}` })
                    .setDescription(`The Cataclysm will begin on ${unixTimestampToDynamicDisplay(unixTimestamp)}, when the current turn ends.`)
            )
        );
    }

    return commandContext.respondWithGameAnnouncement(
        new MessagePayload()
        .addEmbeds(
            new EmbedBuilder()
                .setColor(EMBED_COLOURS.FEAR)
                .setDescription(`Cataclysm set to begin on turn ${cataclysmTurn}. This will take effect after the current turn ends.`)
        )
    );
}
