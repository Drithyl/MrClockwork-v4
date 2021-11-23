
const log = require("../../logger.js");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");
const { SemanticError } = require("../../errors/custom_errors.js");

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

    return commandContext.getMentionedMembers()
    .then((members) =>
    {
        if (members.length <= 0)
            return Promise.reject(new SemanticError(`You must mention the member who you wish to appoint as organizer.`));

        gameObject.setOrganizer(members[0]);
        return gameObject.save();
    })
    .then(() => 
    {
        log.general(log.getLeanLevel(), `${gameObject.getName()}: new organizer ${newOrganizerWrapper.getUsername()} set.`);
        commandContext.respondToCommand(new MessagePayload(`The new organizer is set.`));
    });
}
