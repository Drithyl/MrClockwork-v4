"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var config = require("../../config/config.json");
var getOngoingGameByChannel = require("../../games/ongoing_games_store.js").getOngoingGameByChannel;
var isChannelPendingHosting = require("../game_channels_pending_hosting_store.js").isChannelPendingHosting;
var TimerSetting = require("../../game_settings/dom5/prototypes/timer");
var SemanticError = require("../../errors/custom_errors").SemanticError;
module.exports = CommandContext;
function CommandContext(messageWrapper) {
    var _this = this;
    var _messageWrapper = messageWrapper;
    var _messageContent = messageWrapper.getMessageContent();
    var _targetChannelObject = messageWrapper.getDestinationChannel();
    var _commandString = _extractCommandString(_messageContent);
    var _commandArgumentsArray = _extractCommandArgumentsAsArray(_messageContent);
    var _gameTargetedByCommand = getOngoingGameByChannel(_targetChannelObject.id);
    this.isGameCommand = function () { return _gameTargetedByCommand != null; };
    this.isChannelPendingHosting = function () { return isChannelPendingHosting(_targetChannelObject.id); };
    this.wasSentByDm = function () { return _messageWrapper.isDirectMessage(); };
    this.hasArgumentByRegexp = function (regexp) {
        for (var i = 0; i < _commandArgumentsArray.length; i++)
            if (regexp.test(_commandArgumentsArray[i]) === true)
                return true;
        return false;
    };
    /* only available if command was sent in a guild channel */
    this.getGuildWrapper = function () { return _messageWrapper.getDestinationGuildWrapper(); };
    this.getSenderGuildMemberWrapper = function () { return _messageWrapper.getSenderGuildMemberWrapper(); };
    this.isSenderTrusted = function () {
        var guild = _this.getGuildWrapper();
        var member = _this.getSenderGuildMemberWrapper();
        if (guild == null && member == null)
            throw new SemanticError("This command cannot be used by DM.");
        return guild.memberHasTrustedRole(member);
    };
    this.isSenderGameMaster = function () {
        var guild = _this.getGuildWrapper();
        var member = _this.getSenderGuildMemberWrapper();
        if (guild == null && member == null)
            throw new SemanticError("This command cannot be used by DM.");
        return guild.memberHasGameMasterRole(member);
    };
    this.isSenderGuildOwner = function () {
        var guild = _this.getGuildWrapper();
        var senderId = _this.getCommandSenderId();
        if (guild == null)
            throw new SemanticError("This command cannot be used by DM.");
        return guild.memberIsOwner(senderId);
    };
    /************************************************************/
    this.isSenderDev = function () {
        var senderId = _this.getCommandSenderId();
        return config.devIds.includes(senderId);
    };
    this.isSenderGameOrganizer = function () {
        var game = _this.getGameTargetedByCommand();
        var senderId = _this.getCommandSenderId();
        return senderId === game.getOrganizerId();
    };
    this.isSenderGamePlayer = function () {
        var game = _this.getGameTargetedByCommand();
        var senderId = _this.getCommandSenderId();
        return game.memberIsPlayer(senderId);
    };
    this.getCommandString = function () { return _commandString; };
    this.getCommandArgumentsArray = function () { return __spreadArrays(_commandArgumentsArray); };
    this.getMessageContent = function () { return _messageWrapper.getMessageContent().slice(1); };
    this.getCommandSenderId = function () { return _messageWrapper.getSenderId(); };
    this.getCommandSenderUsername = function () { return _messageWrapper.getSenderUsername(); };
    this.getSenderUserWrapper = function () { return _messageWrapper.getSenderUserWrapper(); };
    this.getSenderGuildMemberWrapper = function () { return _messageWrapper.getSenderGuildMemberWrapper(); };
    this.getGameTargetedByCommand = function () { return _gameTargetedByCommand; };
    this.getDestinationChannel = function () { return _targetChannelObject; };
    this.respondToCommand = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _messageWrapper.respond.apply(_messageWrapper, args);
    };
    this.replaceRoleWith = function (idOfRoleToBeReplaced, idOfRoleToTakeItsPlace) {
        //TODO:
    };
}
function _extractCommandString(messageContent) {
    var messageWords = messageContent.split(/ +/);
    var command = messageWords.shift().toLowerCase();
    return command;
}
function _extractCommandArgumentsAsArray(messageContent) {
    var messageWords = messageContent.split(/ +/);
    messageWords.shift();
    if (messageWords == null)
        return [];
    return messageWords;
}
//# sourceMappingURL=command_context.js.map