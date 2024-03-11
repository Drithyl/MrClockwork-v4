const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");
const { SemanticError } = require("../../../errors/custom_errors.js");


const NATION_OPTION_NAME = "nation_number";
const PLAYER_OPTION_NAME = "player_to_sub";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("substitute")
		.setDescription("[Game-organizer-only] Transfers the claim on a pretender to another player.")
        .addIntegerOption(option =>
            option.setName(NATION_OPTION_NAME)
            .setDescription("A nation number that matches the pretender's index displayed by the pretenders command.")
            .setRequired(true)
            .setMinValue(0)
            .setAutocomplete(true)
        )
        .addUserOption(option =>
            option.setName(PLAYER_OPTION_NAME)
            .setDescription("A mention to the player who will be taking over (@Username#0000).")
            .setRequired(true)
        )
        .setDMPermission(false),

	execute: behaviour,
    autocomplete: autocompletePretenders
};


async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsTrusted(commandContext);
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);
    await commandPermissions.assertGameIsOnline(commandContext);
    await commandPermissions.assertMemberIsOrganizer(commandContext);

    const gameObject = commandContext.targetedGame;
    const nationNumber = commandContext.options.getInteger(NATION_OPTION_NAME);
    const subbedPlayer = await commandContext.fetchMemberWrapperOption(PLAYER_OPTION_NAME);
    const status = gameObject.getLastKnownStatus();
    const nations = status.getPlayers();
    const nationData = nations.find((nation) => nation.nationNumber === nationNumber);


    if (nationData == null)
        throw new SemanticError(`Invalid nation selected. Number does not match any submitted nation.`);

    await gameObject.substitutePlayerControllingNation(subbedPlayer, nationData.filename);
    return commandContext.respondToCommand(new MessagePayload(`Player for nation \`${nationData.fullName}\` was replaced.`));
}

async function autocompletePretenders(autocompleteContext)
{
    const gameObject = autocompleteContext.targetedGame;

    // Shortcircuit if there's no associated game; this is probably a non-game channel
    if (gameObject == null) {
        return;
    }

    const nations = await gameObject.fetchSubmittedNations();
    const humanPretenders = nations.filter((pretender) => {
        return pretender.isSubmitted === true;
    });

    const choices = humanPretenders.map(p => ({ name: p.name, value: p.nationNumber }));

    // Respond with the list of choices that match
    // the focused value, like an autocomplete
    await autocompleteContext.autocomplete(choices);
}
