
const log = require("../../logger.js");
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
    var formattedListAsString = "";
    var game = commandContext.getGameTargetedByCommand();
    
    return game.fetchSubmittedNations()
    .then((listAsArray) => 
    {
        listAsArray.forEach((submittedPretender, index) => 
        {
            if (submittedPretender.isHuman === true)
                formattedListAsString += `${submittedPretender.nationNbr}. `.width(5) + `${_formatSubmittedPretenderLine(submittedPretender, commandContext)}`;
        });

        if (formattedListAsString === "")
            return commandContext.respondToCommand(new MessagePayload(`There are no submitted pretenders.`));

        return commandContext.respondToCommand(new MessagePayload(formattedListAsString.toBox(), "", true, "```"));
    });
}

function _formatSubmittedPretenderLine(submittedPretender)
{
    const fullNationName = submittedPretender.fullName;
    const pretenderOwnerMember = submittedPretender.owner;

    if (pretenderOwnerMember != null)
        return `${fullNationName.width(40)} ${pretenderOwnerMember.getUsername()}\n`;

    else if (assert.isString(pretenderOwnerMember) === true)
        return `${fullNationName.width(40)} ${pretenderOwnerMember}\n`;

    else return `${fullNationName}\n`;
}