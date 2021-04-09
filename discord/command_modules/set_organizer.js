
const log = require("../../logger.js");
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
    var newOrganizerWrapper;

    if (mentionedMembers.length <= 0)
        return commandContext.respondToCommand(`You must mention the member who you wish to appoint as organizer.`);

    newOrganizerWrapper = mentionedMembers[0];
    gameObject.setOrganizer(newOrganizerWrapper);

    return gameObject.save()
    .then(() => 
    {
        log.general(log.getLeanLevel(), `${gameObject.getName()}: new organizer ${newOrganizerWrapper.getUsername()} set.`);
        commandContext.respondToCommand(`The new organizer is set.`);
    });
}
