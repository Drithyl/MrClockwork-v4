const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");
const { SemanticError } = require("../../../errors/custom_errors.js");


const NATION_OPTION_NAME = "nation";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("unclaim")
		.setDescription("Removes your claim from your submitted pretender (without deleting the submitted pretender).")
        .addIntegerOption(option =>
            option.setName(NATION_OPTION_NAME)
            .setDescription("The name of the nation to unclaim.")
            .setMinValue(0)
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
    const gameRole = gameObject.getRole();
    const status = gameObject.getLastKnownStatus();
    const nations = status.getPlayers();
    const memberWrapper = commandContext.memberWrapper;
    const nationNumber = commandContext.options.getInteger(NATION_OPTION_NAME);


    if (nations == null)
        return commandContext.respondToCommand(new MessagePayload(`Nation data is unavailable. You may have to wait a minute.`));

    if (nationNumber == null)
        return commandContext.respondToCommand(new MessagePayload(`You must specify a nation identifier to unclaim.`));

        
    const nationData = nations.find((nation) => nation.nationNumber === nationNumber);
    const hasPermissions = commandContext.isMemberOrganizer === true ||
        gameObject.isPlayerControllingNation(memberWrapper.getId(), nationData.filename) === true;
    

    if (nationData == null)
        throw new new SemanticError(`Invalid nation selected. Number does not match any submitted nation.`);

    if (hasPermissions === false)
        return Promise.reject(new Error(`Only the game organizer or the owner of this nation can do this.`));

    
    await gameObject.removeControlOfNation(nationData.filename);


    if (gameRole != null && gameObject.isMemberPlayer(memberWrapper.getId()) === false)
        await memberWrapper.removeRole(gameRole);


    return commandContext.respondToCommand(new MessagePayload(`Pretender for nation \`${nationData.fullName}\` was unclaimed.`));
}

async function autocompletePretenders(autocompleteContext)
{
    const gameObject = autocompleteContext.targetedGame;

    // Shortcircuit if there's no associated game; this is probably a non-game channel
    if (gameObject == null) {
        return;
    }

    const nations = await gameObject.fetchSubmittedNations();

    if (Array.isArray(nations) === false) {
        return;
    }

    const humanPretenders = nations.filter((pretender) => {
        return pretender.isSubmitted === true;
    });

    const choices = humanPretenders.map(p => ({ name: p.name, value: p.nationNumber }));

    // Respond with the list of choices that match
    // the focused value, like an autocomplete
    await autocompleteContext.autocomplete(choices);
}
