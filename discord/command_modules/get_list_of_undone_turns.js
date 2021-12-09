
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
    var messageString = `Below is the list of undone turns:\n\n`;
    var listString = "";
    var unfinishedTurns;
    var uncheckedTurns;

    if (status == null)
        return commandContext.respondToCommand(new MessagePayload(`Game status is currently unavailable`));

    unfinishedTurns = status.getUnfinishedTurns();
    uncheckedTurns = status.getUncheckedTurns();

    if (uncheckedTurns == null || unfinishedTurns == null)
        return commandContext.respondToCommand(new MessagePayload(`Undone turn data is currently unavailable`));


    if (unfinishedTurns.length > 0)
    {
        listString = "**Unfinished:**\n\n```";
        listString += unfinishedTurns.reduce((finalStr, nationName) => finalStr + `${nationName}\n`, "\n");
        listString += "```\n";
    }

    if (uncheckedTurns.length > 0)
    {
        listString += "**Unchecked:**\n\n```";
        listString += uncheckedTurns.reduce((finalStr, nationName) => finalStr + `${nationName}\n`, "\n");
        listString += "```\n";
    }

    return commandContext.respondToCommand(new MessagePayload(messageString, listString, true, "```"));
}