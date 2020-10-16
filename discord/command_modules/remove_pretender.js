
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const dominions5NationStore = require("../../games/dominions5_nation_store.js");
const { SemanticError } = require("../../errors/custom_errors.js");

const commandData = new CommandData("REMOVE_PRETENDER");

module.exports = RemovePretenderCommand;

function RemovePretenderCommand()
{
    const removePretenderCommand = new Command(commandData);

    removePretenderCommand.addBehaviour(_behaviour);

    removePretenderCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertGameIsOnline,
        commandPermissions.assertGameHasNotStarted,
        commandPermissions.assertMemberIsPlayer,
        assertNationNameExists,
        assertMemberIsOwnerOfPretender
    );

    return removePretenderCommand;
}

/*TODO: I'm getting rid of the pretender display requirement. Instead,
the command to display pretenders can be used to check the names of nations
that have a pretender file submitted, to easily copy and paste it for this command,
but it does not necessarily need to be used if one already knows the nation name
of the pretender submitted, which will be checked within the game.removePretender() function*/
function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const nameOfNationToBeRemoved = extractNationNameArgument(commandContext);

    return gameObject.removePretender(nameOfNationToBeRemoved)
    .then(() => commandContext.respondToCommand(`Pretender was removed.`))
    .catch((err) => commandContext.respondToCommand(`Error occurred when removing pretender:\n\n${err.message}`));
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
    const nameOfNationToBeRemoved = commandArguments[0];
    const playerGuildMemberWrapper = commandContext.getSenderGuildMemberWrapper();

    if (gameObject.isPlayerOwnerOfPretender(playerGuildMemberWrapper, nameOfNationToBeRemoved) === false)
        throw new Error(`You are not the owner of this nation.`);
}

function extractNationNameArgument(commandContext)
{
    const commandArguments = commandContext.getCommandArgumentsArray();
    const nameOfNationToBeRemoved = commandArguments[0];

    return nameOfNationToBeRemoved;
}