
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");

const commandData = new CommandData("GET_PATREON_LINK");

module.exports = GetPatreonLinkCommand;

function GetPatreonLinkCommand()
{
    const getPatreonLinkCommand = new Command(commandData);

    getPatreonLinkCommand.addBehaviour(_behaviour);

    return getPatreonLinkCommand;
}

function _behaviour(commandContext)
{
    return commandContext.respondToCommand(`If you are considering contributing to the project, you can read more information and do so here: https://www.patreon.com/MrClockwork. Thank you!`)
}