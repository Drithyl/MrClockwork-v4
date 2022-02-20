
const assert = require("../../asserter.js");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("DISPLAY_SUBMITTED_PRETENDERS");

module.exports = DisplaySubmittedPretendersCommand;

function DisplaySubmittedPretendersCommand()
{
    const displaySubmittedPretendersCommand = new Command(commandData);

    displaySubmittedPretendersCommand.addBehaviour(_behaviour);

    displaySubmittedPretendersCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertServerIsOnline
    );

    return displaySubmittedPretendersCommand;
}

function _behaviour(commandContext)
{
    var game = commandContext.getGameTargetedByCommand();
    
    return game.fetchSubmittedNations()
    .then((listAsArray) => 
    {
        const humanPretenders = listAsArray.filter((pretender) => pretender.isSubmitted === true);
        const formattedString = _formatSubmittedPretenders(humanPretenders);

        if (humanPretenders.length <= 0)
            return commandContext.respondToCommand(new MessagePayload(`There are no submitted pretenders.`));

        return commandContext.respondToCommand(new MessagePayload(formattedString, "", true, "```"));
    });
}

function _formatSubmittedPretenders(humanPretenderList)
{
    var totalClaimed = 0;
    var formattedStr = "";
    var livingNationsString = "";
    var deadNationsString  = "";

    humanPretenderList.forEach((pretender) =>
    {
        // If claimed, increment our count
        if (pretender.owner != null)
            totalClaimed++;

        if (pretender.isHuman === true)
            livingNationsString += _formatSubmittedPretenderLine(pretender);

        else if (pretender.isDead === true)
            deadNationsString += _formatSubmittedPretenderLine(pretender);
    });

    formattedStr = `Total Submitted: ${humanPretenderList.length}\nTotal Claimed: ${totalClaimed}\n`;

    if (livingNationsString.length > 0)
        formattedStr += `\n**Living nations**:\n${livingNationsString.toBox()}\n`;
        
    if (deadNationsString.length > 0)
        formattedStr += `\n**Dead nations** (use \`!unclaim X\` to have the game removed from your played games list):\n${deadNationsString.toBox()}`;

    return formattedStr;
}

function _formatSubmittedPretenderLine(pretenderData)
{
    const indexString = `${pretenderData.nationNbr}. `.width(5);
    var pretenderStr = pretenderData.fullName.width(40);

    // If .owner property is a string, just add it
    if (assert.isString(pretenderData.owner) === true)
        pretenderStr += `${pretenderData.owner}`;

    // If owner property would be a GuildMemberWrapper, use getUsername()
    else if (pretenderData.owner != null)
        pretenderStr += `${pretenderData.fullName.width(40)} ${pretenderData.owner.getUsername()}`;

    return indexString + pretenderStr + "\n";
}