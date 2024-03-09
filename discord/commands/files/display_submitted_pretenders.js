const { SlashCommandBuilder } = require("discord.js");
const assert = require("../../../asserter.js");
const commandPermissions = require("../../command_permissions.js");
const MessagePayload = require("../../prototypes/message_payload.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pretenders")
		.setDescription("Displays a list of submitted pretenders. Use their numbers for other pretender commands."),

	execute: behaviour
};

async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);(commandContext);
    await commandPermissions.assertServerIsOnline(commandContext);(commandContext);

    let game = commandContext.targetedGame;
    
    const listAsArray = await game.fetchSubmittedNations();
    const humanPretenders = listAsArray.filter((pretender) => pretender.isSubmitted === true);
    const formattedString = _formatSubmittedPretenders(humanPretenders);

    if (humanPretenders.length <= 0)
        return commandContext.respondToCommand(new MessagePayload(`There are no submitted pretenders.`));

    return commandContext.respondToCommand(new MessagePayload(formattedString, "", true, "```"));
}

function _formatSubmittedPretenders(humanPretenderList)
{
    let totalClaimed = 0;
    let formattedStr = "";
    let livingNationsString = "";
    let deadNationsString  = "";
    let justDeadNationsString  = "";

    humanPretenderList.forEach((pretender) =>
    {
        // If claimed, increment our count
        if (pretender.owner != null)
            totalClaimed++;

        if (pretender.isHuman === true)
            livingNationsString += _formatSubmittedPretenderLine(pretender);

        else if (pretender.isDead === true)
            deadNationsString += _formatSubmittedPretenderLine(pretender);

        else if (pretender.hasJustDied === true)
            justDeadNationsString += _formatSubmittedPretenderLine(pretender);
    });

    formattedStr = `Total Submitted: ${humanPretenderList.length}\nTotal Claimed: ${totalClaimed}\n`;

    if (livingNationsString.length > 0)
        formattedStr += `\n**Living nations**:\n${livingNationsString.toBox()}\n`;
        
    if (deadNationsString.length > 0)
        formattedStr += `\n**Dead nations** (use \`/unclaim X\` to have the game removed from your played games list):\n${deadNationsString.toBox()}`;
        
    if (justDeadNationsString.length > 0)
        formattedStr += `\n**Nations that died this turn** (use \`/unclaim X\` to have the game removed from your played games list):\n${justDeadNationsString.toBox()}`;

    return formattedStr;
}

function _formatSubmittedPretenderLine(pretenderData)
{
    const indexString = `${pretenderData.nationNumber}. `;
    let pretenderStr = pretenderData.fullName.width(40);

    // If .owner property is a string, just add it
    if (assert.isString(pretenderData.owner) === true)
        pretenderStr += `${pretenderData.owner}`;

    // If owner property would be a GuildMemberWrapper, use getUsername()
    else if (pretenderData.owner != null)
        pretenderStr = `${pretenderData.fullName.width(40)} ${pretenderData.owner.getUsername()}`;

    return indexString.width(5) + pretenderStr + "\n";
}
