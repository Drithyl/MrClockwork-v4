
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

    var messageString = `Below is the list of undone turns:\n\n`;
    var listString = "";

    // Need to check statusdump instead of the latest tcpquery of the
    // Dominions5Status object, because currently tcpqueries show the
    // full name of the vanilla nations, even if the nation was used as
    // a base for a modded nation that has a different name. Statusdump
    // does not have this problem.
    return gameObject.fetchStatusDump()
    .then((dump) =>
    {
        const nationStatusArray = dump.nationStatusArray;

        if (nationStatusArray == null || nationStatusArray.length <= 0)
            return commandContext.respondToCommand(new MessagePayload(`List of undone turns is currently unavailable.`));

        listString = nationStatusArray.reduce((finalStr, nationData) => 
        {
            if (nationData.isTurnFinished === false)
                return finalStr + `${nationData.fullName}\n`;
    
            else return finalStr;
        }, "\n");
    
        return commandContext.respondToCommand(new MessagePayload(messageString, listString.toBox(), true, "```"));
    });
}