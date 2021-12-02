
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
    return gameObject.emitPromiseWithGameDataToServer("GET_UNDONE_TURNS")
    .then((nationStatusArray) =>
    {
        if (nationStatusArray == null || nationStatusArray.length <= 0)
            return commandContext.respondToCommand(new MessagePayload(`List of undone turns is currently unavailable.`));

        const unfinished = nationStatusArray.filter((nationData) => nationData.isTurnUnfinished);
        const unchecked = nationStatusArray.filter((nationData) => nationData.wasTurnChecked === false);

        if (unfinished.length > 0)
        {
            listString = "**Unfinished:**\n\n```";
            listString += unfinished.reduce((finalStr, nationData) => finalStr + `${nationData.fullName}\n`, "\n");
            listString += "```\n";
        }

        if (unchecked.length > 0)
        {
            listString += "**Unchecked:**\n\n```";
            listString += unchecked.reduce((finalStr, nationData) => finalStr + `${nationData.fullName}\n`, "\n");
            listString += "```\n";
        }
    
        return commandContext.respondToCommand(new MessagePayload(messageString, listString, true, "```"));
    });
}