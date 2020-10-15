"use strict";
var uuidv4 = require("uuid").v4;
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var Dominions5Game = require("../../games/prototypes/dominions5_game.js");
var hostingSessionsStore = require("../../servers/hosting_sessions_store.js");
var hostServerStore = require("../../servers/host_server_store.js");
var SemanticError = require("../../errors/custom_errors.js").SemanticError;
var commandData = new CommandData("HOST_DOM5_GAME_WEB");
module.exports = HostDom5GameWebCommand;
function HostDom5GameWebCommand() {
    var hostDom5GameCommand = new Command(commandData);
    hostDom5GameCommand.addBehaviour(_behaviour);
    hostDom5GameCommand.addRequirements(commandPermissions.assertMemberIsTrusted, _isThereHostingSpaceAvailableOrThrow);
    return hostDom5GameCommand;
}
function _behaviour(commandContext) {
    var guildMemberWrapper = commandContext.getSenderGuildMemberWrapper();
    var userId = guildMemberWrapper.getId();
    var token = uuidv4();
    var newGameObject = new Dominions5Game();
    newGameObject.setOrganizer(guildMemberWrapper);
    hostingSessionsStore.addSession(userId, token, newGameObject);
    return guildMemberWrapper.sendMessage("You can begin the hosting process by accessing the link http://localhost:3000/host_game?userId=" + userId + "&token=" + token + " on your browser.");
}
function _isThereHostingSpaceAvailableOrThrow() {
    var isThereSpace = hostServerStore.isThereHostingSpaceAvailable();
    if (isThereSpace === false)
        throw new SemanticError("There are currently no available slots in any online server to host a game.");
}
//# sourceMappingURL=host_game_web.js.map