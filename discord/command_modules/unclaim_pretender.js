
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");
const dominions5NationStore = require("../../games/dominions5_nation_store.js");

const commandData = new CommandData("UNCLAIM_PRETENDER");

module.exports = UnclaimPretenderCommand;

function UnclaimPretenderCommand()
{
    const unclaimPretenderCommand = new Command(commandData);

    unclaimPretenderCommand.addBehaviour(_behaviour);

    unclaimPretenderCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertGameIsOnline
    );

    return unclaimPretenderCommand;
}

/*TODO: I'm getting rid of the pretender display requirement. Instead,
the command to display pretenders can be used to check the names of nations
that have a pretender file submitted, to easily copy and paste it for this command,
but it does not necessarily need to be used if one already knows the nation name
of the pretender submitted, which will be checked within the game.unclaimPretender() function*/
async function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const commandArguments = commandContext.getCommandArgumentsArray();
    const numberOfNationToBeUnclaimed = commandArguments[0];
    var nationData;

    if (numberOfNationToBeUnclaimed == null)
        return commandContext.respondToCommand(new MessagePayload(`You must specify a nation identifier to unclaim.`));

    nationData = await gameObject.fetchSubmittedNationData(numberOfNationToBeUnclaimed);
    
    await gameObject.removeControlOfNation(nationData.filename)
    return commandContext.respondToCommand(new MessagePayload(`Pretender for nation \`${nationData.fullName}\` was unclaimed.`));
}