
const log = require("../../logger.js");
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
        commandPermissions.assertServerIsOnline,
        commandPermissions.assertMemberIsTrusted
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
                formattedListAsString += `${submittedPretender.nationNbr}. ${_formatSubmittedPretenderLine(submittedPretender, commandContext)}`;
        });

        if (formattedListAsString === "")
            return commandContext.respondToCommand(new MessagePayload(`There are no submitted pretenders.`));

        return commandContext.respondToCommand(new MessagePayload(formattedListAsString.toBox()));
    });
}

function _formatSubmittedPretenderLine(submittedPretender)
{
    const fullNationName = submittedPretender.fullName;
    const pretenderOwnerMember = submittedPretender.owner;

    if (pretenderOwnerMember != null)
    {
        log.general(log.getVerboseLevel(), `Owner for ${fullNationName}: ${pretenderOwnerMember.getId()}`);
        return `${fullNationName.width(40)} ${pretenderOwnerMember.getUsername()}\n`;
    }

    else return `${fullNationName}\n`;
}