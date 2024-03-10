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
            .setDescription("A number that matches the pretender's index displayed; a.k.a. the nation_number.")
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
    let nationData;


    if (nations == null)
        return commandContext.respondToCommand(new MessagePayload(`Nation data is unavailable. You may have to wait a minute.`));

    if (nationNumber == null)
        return commandContext.respondToCommand(new MessagePayload(`You must specify a nation identifier to unclaim.`));

        
    nationData = nations.find((nation) => nation.nationNumber === nationNumber);
    

    if (nationData == null)
        throw new new SemanticError(`Invalid nation selected. Number does not match any submitted nation.`);

    if (gameObject.isPlayerControllingNation(memberWrapper.getId(), nationData.filename) === false)
        return Promise.reject(new Error(`Only the game organizer or the owner of this nation can do this.`));
    
    if (commandContext.isMemberOrganizer === false)
        return Promise.reject(new Error(`Only the game organizer or the owner of this nation can do this.`));

    
    await gameObject.removeControlOfNation(nationData.filename);


    if (gameRole != null && gameObject.isMemberPlayer(memberWrapper.getId()) === false)
        await memberWrapper.removeRole(gameRole);


    return commandContext.respondToCommand(new MessagePayload(`Pretender for nation \`${nationData.fullName}\` was unclaimed.`));
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
            return pretender.isSubmitted === true && pretender.owner != null;
        });
    
        // Array of choices that are available to select. Cut off
        // nation's full name if it exceeds 25 characters (max
        // length of an autocomplete option's name)
        choices = humanPretenders.map((n) => {
            let name = n.fullName;

            if (name > 25) {
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
