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
    // Returns the value of the option currently
    // being focused by the user. "true" makes it
    // return the whole focused object instead of
    // its string value. This way we can access the
    // name of the focused value as well.
    const focusedOption = autocompleteContext.options.getFocused(true);
    const gameObject = autocompleteContext.targetedGame;
    let choices = [];

    try {
        const nations = await gameObject.fetchSubmittedNations();
        const humanPretenders = nations.filter((pretender) => {
            return pretender.isSubmitted === true;
        });
    
        // Array of choices that are available to select. Cut off
        // nation's full name if it exceeds 25 characters (max
        // length of an autocomplete option's name)
        choices = humanPretenders.map((n) => {
            let name = n.fullName;

            if (name.length > 25) {
                name = name.slice(0, 22) + "...";
            }

            return { name, value: n.nationNumber };
        });
    
        // Filter choices based on our focused value
        const filtered = choices.filter(choice =>
            choice.name.toLowerCase().includes(focusedOption.value)
        );
    
        // Respond with the list of choices that match
        // the focused value, like an autocomplete
        await autocompleteContext.respond(
            filtered.map(choice => ({ name: choice.name, value: choice.value })),
        );
    }

    // Probably would error out if game's server is offline and can't fetch pretenders
    catch(error) {
        await autocompleteContext.respond([]);
    }
}
