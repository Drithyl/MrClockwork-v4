
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const hostServerStore = require("../../servers/host_server_store.js");

const commandData = new CommandData("GET_LIST_OF_FREE_HOSTING_SLOTS");

module.exports = GetListOfFreeHostingSlotsCommand;

function GetListOfFreeHostingSlotsCommand()
{
    const getListOfFreeHostingSlotsCommand = new Command(commandData);

    getListOfFreeHostingSlotsCommand.addBehaviour(_behaviour);

    return getListOfFreeHostingSlotsCommand;
}

function _behaviour(commandContext)
{
    var introductionString = "Below is the list of available slots per server:\n\n";
    var stringListOfFreeSlots = hostServerStore.printListOfFreeSlots();

    if (hostServerStore.hasServersOnline() === false)
        return commandContext.respondToCommand(`There are no servers online.`);

    return commandContext.respondToCommand(introductionString + stringListOfFreeSlots.toBox(), { prepend: "```", append: "```" }); 
}