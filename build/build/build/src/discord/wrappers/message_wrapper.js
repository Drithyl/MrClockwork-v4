"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++)
        s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var UserWrapper = require("./user_wrapper");
var guildStore = require("../guild_store.js");
var GuildMemberWrapper = require("./guild_member_wrapper.js");
var commandPrefix = require("../../config/config.json").commandPrefix;
var messenger = require("../messenger.js");
module.exports = MessageWrapper;
function MessageWrapper(discordJsMessageObject) {
    var _this = this;
    var _discordJsMessageObject = discordJsMessageObject;
    var _userWrapper = new UserWrapper(_discordJsMessageObject.author);
    var _guildWrapper;
    var _guildMemberWrapper;
    this.getSenderUserWrapper = function () { return _userWrapper; };
    this.getSenderId = function () { return _userWrapper.getId(); };
    this.getSenderUsername = function () { return _userWrapper.getUsername(); };
    this.getDestinationChannel = function () { return _discordJsMessageObject.channel; };
    this.getDestinationChannelType = function () { return _discordJsMessageObject.channel.type; };
    this.getMessageContent = function () { return _discordJsMessageObject.content; };
    /* only messages sent in guilds (non-dms) will have these properties defined */
    if (_discordJsMessageObject.guild != null)
        _guildWrapper = guildStore.getGuildWrapperById(_discordJsMessageObject.guild.id);
    if (_guildWrapper != null)
        _guildMemberWrapper = new GuildMemberWrapper(_discordJsMessageObject.member, _guildWrapper);
    this.getGuildWrapper = function () { return _guildWrapper; };
    this.getDestinationGuildWrapper = function () { return _guildWrapper; };
    this.getDestinationGuildId = function () { return _guildWrapper.getId(); };
    this.getSenderGuildMemberWrapper = function () { return _guildMemberWrapper; };
    /*****************************************************************************/
    this.wasSentByBot = function () { return _discordJsMessageObject.content.bot; };
    this.editMessageContent = function (newContent) { return _discordJsMessageObject.edit(newContent); };
    this.isDirectMessage = function () { return _this.getDestinationChannelType() === "dm"; };
    this.startsWithCommandPrefix = function () { return _startsWithCommandPrefix(_this.getMessageContent()); };
    this.respond = function (response) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return messenger.send.apply(messenger, __spreadArrays([_this.getDestinationChannel(), response], args));
    };
    this.pin = function () {
        return _discordJsMessageObject.pin();
    };
}
function _startsWithCommandPrefix(messageContent) {
    return messageContent[0] === commandPrefix;
}
//# sourceMappingURL=message_wrapper.js.map