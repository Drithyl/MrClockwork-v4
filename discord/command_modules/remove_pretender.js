
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
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
        commandPermissions.assertGameHasNotStarted
    );

    return removePretenderCommand;
}

function _behaviour(commandContext)
{
    var _nationFilename;
    const gameObject = commandContext.getGameTargetedByCommand();
    const playerGuildMemberWrapper = commandContext.getSenderGuildMemberWrapper();
    const numberOfNationToBeRemoved = _extractNationNumberArgument(commandContext);

    if (numberOfNationToBeRemoved == null)
        return commandContext.respondToCommand(new MessagePayload(`You must specify a nation identifier to unclaim.`));

    return gameObject.fetchSubmittedNationFilename(numberOfNationToBeRemoved)
    .then((nationFilename) =>
    {
        if (nationFilename == null)
            return Promise.reject(new SemanticError(`Invalid nation selected. Number does not match any submitted nation.`));

        if (gameObject.isPlayerControllingNation(playerGuildMemberWrapper.getId(), nationFilename) === false &&
            commandContext.isSenderGameOrganizer() === false)
            return Promise.reject(new Error(`Only the game organizer or the owner of this nation can do this.`));

        _nationFilename = nationFilename;
        return gameObject.emitPromiseWithGameDataToServer("REMOVE_NATION", { nationFilename })  
    })
    .then(() => gameObject.removeControlOfNation(_nationFilename))
    .then(() => commandContext.respondToCommand(new MessagePayload(`Pretender was removed.`)));
}

function _extractNationNumberArgument(commandContext)
{
    const commandArguments = commandContext.getCommandArgumentsArray();
    const nationNbrSent = commandArguments[0];

    return nationNbrSent;
}