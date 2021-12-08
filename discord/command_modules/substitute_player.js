
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");
const { SemanticError } = require("../../errors/custom_errors.js");

const commandData = new CommandData("SUBSTITUTE_PLAYER");

module.exports = SubstitutePlayerCommand;

function SubstitutePlayerCommand()
{
    const substitutePlayerCommand = new Command(commandData);

    substitutePlayerCommand.addBehaviour(_behaviour);

    substitutePlayerCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertGameIsOnline,
        commandPermissions.assertMemberIsOrganizer
    );

    return substitutePlayerCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const numberOfNation = _extractNationNumberArgument(commandContext);
    var subPlayerWrapper;

    return commandContext.getMentionedMembers()
    .then((members) =>
    {
        if (members.length <= 0)
            return Promise.reject(new SemanticError(`You must mention the member who you wish to appoint as substitute.`));
        
        subPlayerWrapper = members[0];
        return gameObject.fetchSubmittedNationFilename(numberOfNation)
    })
    .then((nationFilename) =>
    {
        if (nationFilename == null)
            return Promise.reject(new SemanticError(`Invalid nation selected. Number does not match any submitted nation.`));
    
        return gameObject.substitutePlayerControllingNation(subPlayerWrapper, nationFilename)
        .then(() => commandContext.respondToCommand(new MessagePayload(`Player was replaced.`)));
    });
}

function _extractNationNumberArgument(commandContext)
{
    const commandArguments = commandContext.getCommandArgumentsArray();
    const nbrOfNationToBeReplaced = commandArguments[0];

    return nbrOfNationToBeReplaced;
}