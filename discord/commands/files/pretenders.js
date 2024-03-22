const { SlashCommandBuilder } = require("discord.js");
const assert = require("../../../asserter.js");
const commandPermissions = require("../../command_permissions.js");
const MessagePayload = require("../../prototypes/message_payload.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pretenders")
		.setDescription("Displays a list of submitted pretenders. Use their numbers for other pretender commands.")
        .setDMPermission(false),

	execute: behaviour
};

async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);(commandContext);
    await commandPermissions.assertServerIsOnline(commandContext);(commandContext);

    let game = commandContext.targetedGame;
    
    const listAsArray = await game.fetchSubmittedNations();
    const humanPretenders = listAsArray.filter((pretender) => pretender.isSubmitted === true);


    if (humanPretenders.length <= 0)
        return commandContext.respondToCommand(new MessagePayload(`There are no submitted pretenders.`));


    const headerContentPair = _formatPretenders(humanPretenders);
    return commandContext.respondToCommand(new MessagePayload(headerContentPair[0], headerContentPair[1], true, "```"));
}

function _formatPretenders(humanPretenderList)
{
    let totalClaimed = 0;
    let headerStr = "";
    let contentStr = "";

    humanPretenderList.forEach((pretender) =>
    {
        // If claimed, increment our count
        if (pretender.owner != null)
            totalClaimed++;

        if (pretender.isHuman === true)
            contentStr += _formatSubmittedPretenderLine(pretender);
    });

    headerStr = `Total Submitted: ${humanPretenderList.length}\nTotal Claimed: ${totalClaimed}\n`;
    return [headerStr, contentStr];
}

function _formatSubmittedPretenderLine(pretenderData)
{
    const indexString = `${pretenderData.nationNumber}. `;
    let pretenderStr = pretenderData.fullName;
    
    if (pretenderData.isDead === true) {
        pretenderStr += ' (DEAD)';
    }

    // Space out the nation name before the owner
    pretenderStr = pretenderStr.width(47);

    // If .owner property is a string, just add it
    if (assert.isString(pretenderData.owner) === true)
        pretenderStr += `${pretenderData.owner}`;

    // If owner property would be a GuildMemberWrapper, use getUsername()
    else if (pretenderData.owner != null)
        pretenderStr += pretenderData.owner.getUsername();

    return indexString.width(5) + pretenderStr + "\n";
}
