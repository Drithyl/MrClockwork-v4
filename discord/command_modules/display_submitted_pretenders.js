
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
    var formattedListAsString = "";
    var game = commandContext.getGameTargetedByCommand();
    
    return game.emitPromiseWithGameDataToServer("GET_SUBMITTED_PRETENDERS")
    .then((listAsArray) => 
    {
        listAsArray.forEach((submittedPretender, index) => 
        {
            formattedListAsString += `${submittedPretender.nationNbr}. ${_formatSubmittedPretenderLine(submittedPretender, commandContext)}`;
        });

        if (formattedListAsString === "")
            return commandContext.respondToCommand(`There are no submitted pretenders.`);

        return commandContext.respondToCommand(formattedListAsString.toBox());
    });
}

function _formatSubmittedPretenderLine(submittedPretender, commandContext)
{
    const nationFilename = submittedPretender.filename;
    const fullNationName = submittedPretender.fullName;
    const guildWrapper = commandContext.getGuildWrapper();
    const game = commandContext.getGameTargetedByCommand();
    const pretenderOwnerId = game.getPlayerControllingNationInGame(nationFilename);
    const pretenderOwnerMember = guildWrapper.getGuildMemberWrapperById(pretenderOwnerId);

    if (pretenderOwnerId != null)
        return `${fullNationName.width(40)} ${pretenderOwnerMember.getUsername()}\n`;

    else
        return `${fullNationName}\n`;
}