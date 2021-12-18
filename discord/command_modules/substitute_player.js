
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

async function _behaviour(commandContext)
{
    const members = await commandContext.getMentionedMembers();
    const gameObject = commandContext.getGameTargetedByCommand();
    const numberOfNation = _extractNationNumberArgument(commandContext);
    var subPlayerWrapper;
    var nationData;

    if (members.length <= 0)
        return Promise.reject(new SemanticError(`You must mention the member who you wish to appoint as substitute.`));
    
    subPlayerWrapper = members[0];
    nationData = await gameObject.fetchSubmittedNationData(numberOfNation);

    if (nationData == null)
        return Promise.reject(new SemanticError(`Invalid nation selected. Number does not match any submitted nation.`));

    await gameObject.substitutePlayerControllingNation(subPlayerWrapper, nationData.filename);
    return commandContext.respondToCommand(new MessagePayload(`Player for nation \`${nationData.fullName}\` was replaced.`));
}

function _extractNationNumberArgument(commandContext)
{
    const commandArguments = commandContext.getCommandArgumentsArray();
    const nbrOfNationToBeReplaced = commandArguments[0];

    return nbrOfNationToBeReplaced;
}