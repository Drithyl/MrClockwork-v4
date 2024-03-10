const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const dice = require("../../../dice.js");


const DICE_OPTION_NAME = "roll_input";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("roll")
		.setDescription("Rolls whatever dice combination you specify as a parameter.")
        .addStringOption(option =>
            option.setName(DICE_OPTION_NAME)
            .setDescription("A roll. Adding a `+` after a dice expression will make them explosive, i.e. `5d6++10d10+`.")
            .setRequired(true)
        ),

	execute: behaviour
};


function behaviour(commandContext)
{
    const diceInput = commandContext.options.getString(DICE_OPTION_NAME).replace(/\s/, "");
    const result = dice.processRolls(diceInput);

    return commandContext.respondToCommand(new MessagePayload(result));
}
