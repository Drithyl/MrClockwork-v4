
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
    const status = gameObject.getLastKnownStatus();
    const nations = status.getPlayers();
    const gameRole = gameObject.getRole();
    const memberWrapper = commandContext.getSenderGuildMemberWrapper();
    const commandArguments = commandContext.getCommandArgumentsArray();
    const nationNumberSent = +commandArguments[0];
    var nationData;


    if (nations == null)
        return commandContext.respondToCommand(new MessagePayload(`Nation data is unavailable. You may have to wait a minute.`));

    if (nationNumberSent == null)
        return commandContext.respondToCommand(new MessagePayload(`You must specify a nation identifier to unclaim.`));

        
    nationData = nations.find((nation) => nation.nationNbr === nationNumberSent);
    

    if (nationData == null)
        return Promise.reject(new SemanticError(`Invalid nation selected. Number does not match any submitted nation.`));


    await gameObject.claimNation(memberWrapper, nationData.filename);


    if (gameRole != null)
        await memberWrapper.addRole(gameRole);


    return commandContext.respondToCommand(new MessagePayload(`Pretender for nation \`${nationData.fullName}\` was claimed.`));
}