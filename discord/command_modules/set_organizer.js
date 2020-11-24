
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("SET_ORGANIZER");

module.exports = SetOrganizerCommand;

function SetOrganizerCommand()
{
    const setOrganizerCommand = new Command(commandData);

    setOrganizerCommand.addBehaviour(_behaviour);

    setOrganizerCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertMemberIsOrganizer
    );

    return setOrganizerCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const mentionedMembers = commandContext.getMentionedMembers();

    if (mentionedMembers.length <= 0)
        return commandContext.respondToCommand(`You must mention the member who you wish to appoint as organizer.`);

    gameObject.setOrganizer(mentionedMembers[0]);
    return commandContext.respondToCommand(`The new organizer is set.`);
}
