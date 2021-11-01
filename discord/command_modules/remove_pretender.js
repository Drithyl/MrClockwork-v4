
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const dominions5NationStore = require("../../games/dominions5_nation_store.js");
const { SemanticError } = require("../../errors/custom_errors.js");
const MessagePayload = require("../prototypes/message_payload.js");

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
        assertNationNameExists,
        assertMemberIsOwnerOfPretender
    );

    return removePretenderCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const nameOfNationToBeRemoved = extractNationNameArgument(commandContext);
    const nationObject = dominions5NationStore.getNation(nameOfNationToBeRemoved);
    const nationFilename = nationObject.getFilename();

    return gameObject.emitPromiseWithGameDataToServer("REMOVE_NATION", { nationFilename: nationFilename })
    .then(() => gameObject.removeControlOfNation(nationFilename))
    .then(() => commandContext.respondToCommand(new MessagePayload(`Pretender was removed.`)));
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
    const nationName = extractNationNameArgument(commandContext);
    const gameObject = commandContext.getGameTargetedByCommand();
    const playerGuildMemberWrapper = commandContext.getSenderGuildMemberWrapper();
    var nationObject;

    if (nationName == null)
        return commandContext.respondToCommand(new MessagePayload(`You must specify a nation identifier to unclaim.`));

    nationObject = dominions5NationStore.getNation(nationName);

    if (gameObject.isPlayerControllingNation(playerGuildMemberWrapper.getId(), nationObject.getFilename()) === false)
        throw new Error(`You are not the owner of this nation.`);
}

function extractNationNameArgument(commandContext)
{
    const commandArguments = commandContext.getCommandArgumentsArray();
    const nameOfNationToBeRemoved = commandArguments[0];

    return nameOfNationToBeRemoved;
}