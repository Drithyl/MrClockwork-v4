
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("GET_LIST_OF_UNDONE_TURNS");

module.exports = GetListOfUndoneTurnsCommand;

function GetListOfUndoneTurnsCommand()
{
    const getListOfUndoneTurnsCommand = new Command(commandData);

    getListOfUndoneTurnsCommand.addBehaviour(_behaviour);

    getListOfUndoneTurnsCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertServerIsOnline,
        commandPermissions.assertGameHasStarted
    );

    return getListOfUndoneTurnsCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const status = gameObject.getLastKnownStatus();
    const players = status.getPlayers();

    var messageString = `Below is the list of undone turns:\n\n`;
    var listString = "";

    if (players == null)
        return commandContext.respondToCommand(new MessagePayload(`List of undone turns is currently unavailable.`));


    listString = players.reduce((playersInfo, playerData) => 
    {
        if (playerData.isTurnDone === false)
            return playersInfo + `${playerData.name}\n`;

        else return playersInfo;
    }, "\n");

    
    return commandContext.respondToCommand(new MessagePayload(messageString, listString.toBox(), true, "```"));
}