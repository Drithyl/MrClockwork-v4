
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
        assertNationNameExists,
        assertMemberIsOwnerOfPretender
    );

    return substitutePlayerCommand;
}

/*TODO: I'm getting rid of the pretender display requirement. Instead,
the command to display pretenders can be used to check the names of nations
that have a pretender file submitted, to easily copy and paste it for this command,
but it does not necessarily need to be used if one already knows the nation name
of the pretender submitted, which will be checked within the game.substitutePlayer() function*/
function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const nameOfNation = extractNationNameArgument(commandContext);
    const nationObject = dominions5NationStore.getNation(nameOfNation);
    const mentionedMembers = commandContext.getMentionedMembers();
    var subPlayerWrapper;

    if (mentionedMembers.length <= 0)
        return commandContext.respondToCommand(`You must mention the member who you wish to appoint as substitute.`);

    subPlayerWrapper = mentionedMembers[0];

    return gameObject.substitutePlayerControllingNation(subPlayerWrapper.getId(), nationObject.getFilename())
    .then(() => commandContext.respondToCommand(`Player was replaced.`));
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

function assertMemberIsOwnerOfPretender(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const commandArguments = commandContext.getCommandArgumentsArray();
    const nameOfNationToBeReplaced = commandArguments[0];
    const playerGuildMemberWrapper = commandContext.getSenderGuildMemberWrapper();

    if (gameObject.isPlayerControllingNation(playerGuildMemberWrapper, nameOfNationToBeReplaced) === false)
        throw new Error(`You are not the owner of this nation.`);
}

function extractNationNameArgument(commandContext)
{
    const commandArguments = commandContext.getCommandArgumentsArray();
    const nameOfNationToBeReplaced = commandArguments[0];

    return nameOfNationToBeReplaced;
}