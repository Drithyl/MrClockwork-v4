
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

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
    var formattedListAsString;
    var game = commandContext.getGameTargetedByCommand();
    
    game.getSubmittedPretenders()
    .then((listAsArray) => 
    {
        formattedListAsString = _formatSubmittedPretenderList(listAsArray);
        commandContext.respondToCommand(formattedListAsString);
    });
}

function _formatSubmittedPretenderList(listAsArray)
{
    var formattedListAsString = "";

    listAsArray.forEach((submittedPretender, index) => 
        formattedListAsString += `${index}. ${_formatSubmittedPretenderLine(submittedPretender)}`);

    return formattedListAsString;
}

function _formatSubmittedPretenderLine(submittedPretender)
{
    var fullNationName = submittedPretender.getFullNationName();
    var pretenderOwner = submittedPretender.getOwnerUsername();

    if (submittedPretender.isClaimed() === true)
        return `${fullNationName.width(40)} ${pretenderOwner}\n`;

    else
        return `${fullNationName}\n`;
}