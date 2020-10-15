
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("UNCLAIM_PRETENDER");

module.exports = UnclaimPretenderCommand;

function UnclaimPretenderCommand()
{
    const unclaimPretenderCommand = new Command(commandData);

    unclaimPretenderCommand.addBehaviour(_behaviour);

    unclaimPretenderCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertGameIsOnline,
        commandPermissions.assertGameHasNotStarted
    );

    return unclaimPretenderCommand;
}

/*TODO: I'm getting rid of the pretender display requirement. Instead,
the command to display pretenders can be used to check the names of nations
that have a pretender file submitted, to easily copy and paste it for this command,
but it does not necessarily need to be used if one already knows the nation name
of the pretender submitted, which will be checked within the game.unclaimPretender() function*/
function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const commandArguments = commandContext.getCommandArgumentsArray();
    const nameOfNationToBeUnclaimed = commandArguments[0];

    //TODO: check nation name/filename here, with the dom5 nation JSON data?

    return gameObject.unclaimPretender(nameOfNationToBeUnclaimed)
    .then(() => commandContext.respondToCommand(`Pretender was unclaimed.`))
    .catch((err) => commandContext.respondToCommand(`Error occurred when unclaiming pretender:\n\n${err.message}`));
}