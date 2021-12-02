
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

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const playerId = commandContext.getCommandSenderId();
    const commandArguments = commandContext.getCommandArgumentsArray();
    const nationNumberSent = commandArguments[0];

    return gameObject.fetchSubmittedNationFilename(nationNumberSent)
    .then((nationFilename) =>
    {
        if (nationFilename == null)
            return Promise.reject(new SemanticError(`Invalid nation selected. Number does not match any submitted nation.`));

        else return gameObject.claimNation(playerId, nationFilename);
    })
    .then(() => commandContext.respondToCommand(new MessagePayload(`Pretender was claimed.`)));
}