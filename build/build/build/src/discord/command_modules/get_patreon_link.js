"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandData = new CommandData("GET_PATREON_LINK");
module.exports = GetPatreonLinkCommand;
function GetPatreonLinkCommand() {
    var getPatreonLinkCommand = new Command(commandData);
    getPatreonLinkCommand.addBehaviour(_behaviour);
    return getPatreonLinkCommand;
}
function _behaviour(commandContext) {
    return commandContext.respondToCommand("If you are considering contributing to the project, you can read more information and do so here: https://www.patreon.com/MrClockwork. Thank you!");
}
//# sourceMappingURL=get_patreon_link.js.map