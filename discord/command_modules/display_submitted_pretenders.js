
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
        const humanPretenders = listAsArray.filter((pretender) => pretender.isHuman === true);
        const formattedString = _formatSubmittedPretenders(humanPretenders);

        if (humanPretenders.length <= 0)
            return commandContext.respondToCommand(new MessagePayload(`There are no submitted pretenders.`));

        return commandContext.respondToCommand(new MessagePayload(formattedString, "", true, "```"));
    });
}

function _formatSubmittedPretenders(humanPretenderList)
{
    var totalClaimed = 0;
    var countString = "";
    var formattedString = "";

    humanPretenderList.forEach((pretender) =>
    {
        const fullNationName = pretender.fullName;
        const pretenderOwnerMember = pretender.owner;

        const indexString = `${pretender.nationNbr}. `.width(5);
        var pretenderStr = fullNationName.width(40);

        // If claimed, increment our count
        if (pretenderOwnerMember != null)
            totalClaimed++;

        // If .owner property is a string, just add it
        if (assert.isString(pretenderOwnerMember) === true)
            pretenderStr += `${pretenderOwnerMember}`;
    
        // If owner property would be a GuildMemberWrapper, use getUsername()
        else if (pretenderOwnerMember != null)
            pretenderStr += `${fullNationName.width(40)} ${pretenderOwnerMember.getUsername()}`;

        formattedString += indexString + pretenderStr + "\n";
    });

    countString = `Total Submitted: ${humanPretenderList.length}\nTotal Claimed: ${totalClaimed}\n`;
    return countString + formattedString.toBox();
}