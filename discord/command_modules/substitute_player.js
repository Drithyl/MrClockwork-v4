
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const dominions5NationStore = require("../../games/dominions5_nation_store.js");
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
        commandPermissions.assertMemberIsOrganizer,
        assertNationNameExists
    );

    return substitutePlayerCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const nameOfNation = extractNationNameArgument(commandContext);
    const nationObject = dominions5NationStore.getNation(nameOfNation);
    const nationFilename = nationObject.getFilename();
    const mentionedMembers = commandContext.getMentionedMembers();
    var subPlayerWrapper;

    if (gameObject.getPlayerIdControllingNationInGame(nationFilename) == null)
        return commandContext.respondToCommand(new MessagePayload(`Nation is not claimed.`));

    if (mentionedMembers.length <= 0)
        return commandContext.respondToCommand(new MessagePayload(`You must mention the member who you wish to appoint as substitute.`));

    subPlayerWrapper = mentionedMembers[0];

    return gameObject.substitutePlayerControllingNation(subPlayerWrapper.getId(), nationFilename)
    .then(() => commandContext.respondToCommand(new MessagePayload(`Player was replaced.`)));
}

function assertNationNameExists(commandContext)
{
    const nationName = extractNationNameArgument(commandContext);
    const gameObject = commandContext.getGameTargetedByCommand();
    const gameSettings = gameObject.getSettingsObject();
    const eraSetting = gameSettings.getEraSetting();
    const eraValue = eraSetting.getValue();

    if (dominions5NationStore.isValidNationIdentifierInEra(nationName, eraValue) === false)
        throw new SemanticError(`Invalid nation selected. Name does not match any nation in this era.`);
}

function extractNationNameArgument(commandContext)
{
    const commandArguments = commandContext.getCommandArgumentsArray();
    const nameOfNationToBeReplaced = commandArguments[0];

    return nameOfNationToBeReplaced;
}