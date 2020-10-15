"use strict";
var _a = require("../errors/custom_errors.js"), SemanticError = _a.SemanticError, PermissionsError = _a.PermissionsError;
exports.assertCommandIsUsedInGameChannel = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _assertCommandIsUsedInGameChannel.apply(void 0, args);
};
exports.assertServerIsOnline = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _assertServerIsOnline.apply(void 0, args);
};
exports.assertGameIsOnline = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _assertGameIsOnline.apply(void 0, args);
};
exports.assertGameHasStarted = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _assertGameHasStarted.apply(void 0, args);
};
exports.assertGameHasNotStarted = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _assertGameHasNotStarted.apply(void 0, args);
};
exports.assertGameIsBlitz = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _assertGameIsBlitz.apply(void 0, args);
};
exports.assertGameIsNotBlitz = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _assertGameIsNotBlitz.apply(void 0, args);
};
exports.assertMemberIsTrusted = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _assertMemberIsTrusted.apply(void 0, args);
};
exports.assertMemberIsGameMaster = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _assertMemberIsGameMaster.apply(void 0, args);
};
exports.assertMemberIsGuildOwner = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _assertMemberIsGuildOwner.apply(void 0, args);
};
exports.assertMemberIsOrganizer = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _assertMemberIsOrganizer.apply(void 0, args);
};
exports.assertMemberIsPlayer = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _assertMemberIsPlayer.apply(void 0, args);
};
exports.assertMemberIsDev = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _assertMemberIsDev.apply(void 0, args);
};
exports.assertBotHasPermissionToManageRoles = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _assertBotHasPermissionToManageRoles.apply(void 0, args);
};
exports.assertBotHasPermissionToManageChannels = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _assertBotHasPermissionToManageChannels.apply(void 0, args);
};
//TODO: revise all functions, many were written with an older version of the commandContext
function _assertCommandIsUsedInGameChannel(commandContext) {
    if (commandContext.isGameCommand() === false)
        throw new SemanticError("This command must be used in the channel of an ongoing game.");
}
//TODO: Specify type of Error thrown
function _assertServerIsOnline(commandContext) {
    var game = commandContext.getGameTargetedByCommand();
    if (game.isServerOnline() === false)
        throw new Error("The server on which this game is hosted is offline.");
}
//TODO: Specify type of Error thrown
function _assertGameIsOnline(commandContext) {
    var game = commandContext.getGameTargetedByCommand();
    if (game.isOnline() === false)
        throw new Error("This game's instance is offline.");
}
function _assertGameHasStarted(commandContext) {
    var game = commandContext.getGameTargetedByCommand();
    if (game.assertGameHasStarted() === false)
        throw new SemanticError("This game has not started yet.");
}
function _assertGameHasNotStarted(commandContext) {
    var game = commandContext.getGameTargetedByCommand();
    if (game.assertGameHasStarted() === true)
        throw new SemanticError("This game has already started.");
}
function _assertGameIsBlitz(commandContext) {
    var game = commandContext.getGameTargetedByCommand();
    if (game.assertGameIsBlitz() === false)
        throw new SemanticError("This command can only be used in a blitz game.");
}
function _assertGameIsNotBlitz(commandContext) {
    var game = commandContext.getGameTargetedByCommand();
    if (game.assertGameIsBlitz() === true)
        throw new SemanticError("This command cannot be used in a blitz game.");
}
function _assertMemberIsTrusted(commandContext) {
    if (commandContext.isSenderTrusted() === false &&
        commandContext.isSenderGameMaster() === false &&
        commandContext.isSenderGuildOwner() === false)
        throw new PermissionsError("You must be a trusted member before you can use this command.");
}
function _assertMemberIsGameMaster(commandContext) {
    if (commandContext.isSenderGameMaster() === false)
        throw new PermissionsError("You must be a Game Master to use this command.");
}
function _assertMemberIsGuildOwner(commandContext) {
    if (commandContext.isSenderGuildOwner() === false)
        throw new PermissionsError("Only the owner of this guild can use this command.");
}
function _assertMemberIsOrganizer(commandContext) {
    if (commandContext.isSenderGameOrganizer() === false &&
        commandContext.isSenderGameMaster() === false &&
        commandContext.isSenderGuildOwner() === false)
        throw new PermissionsError("You must be the organizer of this game.");
}
function _assertMemberIsPlayer(commandContext) {
    if (commandContext.isSenderGamePlayer() === false)
        throw new PermissionsError("Only players registered in this game can use this command.");
}
function _assertMemberIsDev(commandContext) {
    var senderId = commandContext.getCommandSenderId();
    if (commandContext.isSenderDev() === false)
        throw new PermissionsError("This command can only be used by the bot devs.");
}
function _assertBotHasPermissionToManageRoles(commandContext) {
    var guildWrapper = getGuildWrapper(commandContext);
    return guildWrapper.doesBotHavePermission("MANAGE_ROLES");
}
function _assertBotHasPermissionToManageChannels(commandContext) {
    var guildWrapper = getGuildWrapper(commandContext);
    return guildWrapper.doesBotHavePermission("MANAGE_CHANNELS");
}
function getGuildWrapper(commandContext) {
    if (commandContext.wasSentByDm() === true)
        throw new SemanticError("This command must be used inside a guild channel.");
    return commandContext.getGuildWrapper();
}
//# sourceMappingURL=command_permissions.js.map