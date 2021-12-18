
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const MessagePayload = require("../prototypes/message_payload.js");
const commandPermissions = require("../command_permissions.js");
const { SemanticError } = require("../../errors/custom_errors.js");

const commandData = new CommandData("CLAIM_PRETENDER");

module.exports = ClaimPretenderCommand;

function ClaimPretenderCommand()
{
    const claimPretenderCommand = new Command(commandData);

    claimPretenderCommand.addBehaviour(_behaviour);

    claimPretenderCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertGameIsOnline
    );

    return claimPretenderCommand;
}

async function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const memberWrapper = commandContext.getSenderGuildMemberWrapper();
    const commandArguments = commandContext.getCommandArgumentsArray();
    const nationNumberSent = commandArguments[0];
    const nationData = await gameObject.fetchSubmittedNationData(nationNumberSent);

    if (nationData == null)
        return Promise.reject(new SemanticError(`Invalid nation selected. Number does not match any submitted nation.`));

    await gameObject.claimNation(memberWrapper, nationData.filename);
    return commandContext.respondToCommand(new MessagePayload(`Pretender for nation \`${nationData.fullName}\` was claimed.`));
}