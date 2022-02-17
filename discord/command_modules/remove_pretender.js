
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
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertGameIsOnline,
        commandPermissions.assertGameHasNotStarted
    );

    return removePretenderCommand;
}

async function _behaviour(commandContext)
{
    const memberWrapper = commandContext.getSenderGuildMemberWrapper();
    const gameObject = commandContext.getGameTargetedByCommand();
    const gameRole = gameObject.getRole();
    const status = gameObject.getLastKnownStatus();
    const nations = status.getPlayers();
    const commandArguments = commandContext.getCommandArgumentsArray();
    const nationNumberSent = +commandArguments[0];
    const nationData = nations.find((nation) => nation.nationNbr === nationNumberSent);


    if (nationNumberSent == null)
        return commandContext.respondToCommand(new MessagePayload(`You must specify a nation identifier to unclaim.`));

    if (nationData == null)
        return Promise.reject(new SemanticError(`Invalid nation selected. Number does not match any submitted nation.`));

    if (gameObject.isPlayerControllingNation(memberWrapper.getId(), nationData.filename) === false &&
        commandContext.isSenderGameOrganizer() === false)
        return Promise.reject(new Error(`Only the game organizer or the owner of this nation can do this.`));

    
    await gameObject.emitPromiseWithGameDataToServer("REMOVE_NATION", { nationFilename: nationData.filename });
    await gameObject.removeControlOfNation(nationData.filename);

    if (gameRole != null && gameObject.memberIsPlayer(memberWrapper.getId()) === false)
        await memberWrapper.removeRole(gameRole);

    return commandContext.respondToCommand(new MessagePayload(`Pretender for nation \`${nationData.fullName}\` was removed.`));
}

function _extractNationNumberArgument(commandContext)
{
    const commandArguments = commandContext.getCommandArgumentsArray();
    const nationNbrSent = commandArguments[0];

    return nationNbrSent;
}