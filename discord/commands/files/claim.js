const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const { SemanticError } = require("../../../errors/custom_errors.js");


const NATION_OPTION_NAME = "nation";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("claim")
		.setDescription("[Game-organizer-only] Change game settings, provided the game hasn't started yet.")
        .addIntegerOption(option =>
            option.setName(NATION_OPTION_NAME)
            .setDescription("The name of the nation to claim.")
            .setRequired(true)
            .setAutocomplete(true)
        )
        .setDMPermission(false),

	execute: behaviour,
    autocomplete: autocompletePretenders
};

async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);
    await commandPermissions.assertGameIsOnline(commandContext);

    const gameObject = commandContext.targetedGame;
    const status = gameObject.getLastKnownStatus();
    const nations = status.getPlayers();
    const gameRole = gameObject.getRole();
    const memberWrapper = commandContext.memberWrapper;
    const nationNumber = commandContext.options.getInteger(NATION_OPTION_NAME);
    let nationData;


    if (nations == null)
        return commandContext.respondToCommand(new MessagePayload(`Nation data is unavailable. You may have to wait a minute.`));

    if (nationNumber == null)
        return commandContext.respondToCommand(new MessagePayload(`You must specify a nation identifier to unclaim.`));

        
    nationData = nations.find((nation) => nation.nationNumber === nationNumber);
    

    if (nationData == null)
        throw new SemanticError(`Invalid nation selected. Number does not match any submitted nation.`);


    await gameObject.claimNation(memberWrapper, nationData.filename);


    if (gameRole != null)
        await memberWrapper.addRole(gameRole);


    return commandContext.respondToCommand(
        new MessagePayload(
            `Pretender for nation \`${nationData.fullName}\` was claimed.`
        )
    );
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
