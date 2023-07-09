const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const { SemanticError } = require("../../../errors/custom_errors.js");


const NATION_OPTION_NAME = "nation_number";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("claim")
		.setDescription("[Game-organizer-only] Change game settings, provided the game hasn't started yet.")
        .addIntegerOption(option =>
            option.setName(NATION_OPTION_NAME)
            .setDescription("A number that matches the pretender's index displayed by the `pretenders` command.")
            .setRequired(true)
        ),

	execute: behaviour
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

        
    nationData = nations.find((nation) => nation.nationNbr === nationNumber);
    

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