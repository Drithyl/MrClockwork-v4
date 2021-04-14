
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("GET_LIST_OF_UNDONE_TURNS");

module.exports = GetListOfUndoneTurnsCommand;

function GetListOfUndoneTurnsCommand()
{
    const getListOfUndoneTurnsCommand = new Command(commandData);

    getListOfUndoneTurnsCommand.addBehaviour(_behaviour);

    getListOfUndoneTurnsCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertServerIsOnline,
        commandPermissions.assertGameHasStarted
    );

    return getListOfUndoneTurnsCommand;
}

function _behaviour(commandContext)
{
    var gameObject = commandContext.getGameTargetedByCommand();
    var messageString = `Below is the list of undone turns:\n\n`;
    var listString = "";
    
    return gameObject.getListOfUndoneTurns()
    .then((listAsArray) =>
    {
        listAsArray.forEach((nationFullName) =>
        {
            listString += `${nationFullName}\n`;
        });

        return commandContext.respondToCommand(messageString + listString.toBox());
    });
}