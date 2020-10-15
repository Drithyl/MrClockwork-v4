"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++)
        s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var messenger = require("../messenger.js");
module.exports = GuildMemberWrapper;
function GuildMemberWrapper(discordJsGuildMemberObject, guildWrapper) {
    var _discordJsGuildMemberObject = discordJsGuildMemberObject;
    var _guildWrapper = guildWrapper;
    this.getGuildWrapper = function () { return _guildWrapper; };
    this.getId = function () { return discordJsGuildMemberObject.id; };
    this.getUsername = function () { return discordJsGuildMemberObject.user.username; };
    this.getGuildId = function () { return _guildWrapper.getGuildId(); };
    this.hasRole = function (discordRoleId) { return _discordJsGuildMemberObject.roles.cache.get(discordRoleId) != null; };
    this.addRole = function (discordRoleObject) { return _discordJsGuildMemberObject.roles.add(discordRoleObject); };
    this.removeRole = function (discordRoleObject) { return _discordJsGuildMemberObject.roles.remove(discordRoleObject); };
    this.getHighestDiscordRolePosition = function () { return _discordJsGuildMemberObject.highest.position; };
    this.getLastMessageInGuild = function () { return _discordJsGuildMemberObject.lastMessage; };
    this.sendMessage = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return messenger.send.apply(messenger, __spreadArrays([_discordJsGuildMemberObject], args));
    };
}
//# sourceMappingURL=guild_member_wrapper.js.map