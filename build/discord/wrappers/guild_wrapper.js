"use strict";
var messenger = require("../messenger.js");
var guildStore = require("../guild_store.js");
var guildDataStore = require("../guild_data_store.js");
var GuildMemberWrapper = require("./guild_member_wrapper.js");
module.exports = GuildWrapper;
function GuildWrapper(discordJsGuildObject) {
    var _this = this;
    var _discordJsGuildObject = discordJsGuildObject;
    this.getId = function () { return _discordJsGuildObject.id; };
    this.getName = function () { return _discordJsGuildObject.name; };
    this.getOwner = function () { return _discordJsGuildObject.owner; };
    this.getDiscordJsBotMemberInGuild = function () { return _discordJsGuildObject.me; };
    this.isAvailable = function () { return _discordJsGuildObject.available; };
    this.getNewsChannel = function () { return _discordJsGuildObject.channels.cache.get(guildDataStore.getNewsChannelId(_this.getId())); };
    this.getHelpChannel = function () { return _discordJsGuildObject.channels.cache.get(guildDataStore.getHelpChannelId(_this.getId())); };
    this.getRecruitingCategory = function () { return _discordJsGuildObject.channels.cache.get(guildDataStore.getRecruitingCategoryId(_this.getId())); };
    this.getBlitzRecruitingCategory = function () { return _discordJsGuildObject.channels.cache.get(guildDataStore.getBlitzRecruitingCategoryId(_this.getId())); };
    this.getGameCategory = function () { return _discordJsGuildObject.channels.cache.get(guildDataStore.getGameCategoryId(_this.getId())); };
    this.getBlitzCategory = function () { return _discordJsGuildObject.channels.cache.get(guildDataStore.getBlitzCategoryId(_this.getId())); };
    this.getGameMasterRole = function () { return _discordJsGuildObject.roles.cache.get(guildDataStore.getGameMasterRoleId(_this.getId())); };
    this.getTrustedRole = function () { return _discordJsGuildObject.roles.cache.get(guildDataStore.getTrustedRoleId(_this.getId())); };
    this.getBlitzerRole = function () { return _discordJsGuildObject.roles.cache.get(guildDataStore.getBlitzerRoleId(_this.getId())); };
    this.memberIsOwner = function (memberId) { return memberId === _discordJsGuildObject.ownerID; };
    this.memberHasTrustedRole = function (guildMemberWrapper) { return guildMemberWrapper.hasRole(guildDataStore.getTrustedRoleId(_this.getId())) === true; };
    this.memberHasBlitzerRole = function (guildMemberWrapper) { return guildMemberWrapper.hasRole(guildDataStore.getBlitzerRoleId(_this.getId())) === true; };
    this.memberHasGameMasterRole = function (guildMemberWrapper) { return guildMemberWrapper.hasRole(guildDataStore.getBlitzerRoleId(_this.getId())) === true; };
    this.postNews = function (newsString) {
        var newsChannel = _this.getNewsChannel();
        return messenger.send(newsChannel, newsString);
    };
    this.updateHelpChannel = function (updatedHelpString) {
        var helpChannel = _this.getHelpChannel();
        if (helpChannel == null)
            return Promise.resolve();
        return _clearChannel(helpChannel)
            .then(function () { return messenger.send(helpChannel, updatedHelpString); });
    };
    this.deployBot = function () { return guildStore.deployBotOnGuild(_this.getId()); };
    this.findChannel = function (channelId) {
        console.log("Searching for channel " + channelId);
        return _discordJsGuildObject.channels.resolve(channelId);
    };
    this.findRole = function (roleId) {
        console.log("Searching for role " + roleId);
        return _discordJsGuildObject.roles.resolve(roleId);
    };
    this.findOrCreateCategory = function (existingId) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var existingCategory = _this.findChannel(existingId);
        if (existingCategory != null)
            return Promise.resolve(existingCategory);
        else
            return _this.createCategory.apply(_this, args);
    };
    this.findOrCreateChannel = function (existingId) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.log("Finding channel " + existingId + "...");
        var existingChannel = _this.findChannel(existingId);
        if (existingChannel != null) {
            console.log("Channel exists, resolving.");
            return Promise.resolve(existingChannel);
        }
        else {
            console.log("Channel not found");
            return _this.createChannel.apply(_this, args);
        }
    };
    this.findOrCreateRole = function (existingId) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.log("Finding role " + existingId + "...");
        var existingRole = _this.findRole(existingId);
        if (existingRole != null) {
            console.log("Role exists, resolving.");
            return Promise.resolve(existingRole);
        }
        else {
            console.log("Role not found");
            return _this.createRole.apply(_this, args);
        }
    };
    this.createCategory = function (name, permissions) {
        return _discordJsGuildObject.channels.create(name, { type: "category", permissionOverwrites: permissions });
    };
    this.createChannel = function (name, permissionOverwrites, parent) {
        if (parent === void 0) { parent = null; }
        console.log("Creating channel " + name + "...");
        return _discordJsGuildObject.channels.create(name, {
            type: "text",
            permissionOverwrites: permissionOverwrites,
            parent: parent
        })
            .then(function (channel) {
            console.log("Channel created");
            return Promise.resolve(channel);
        });
    };
    this.createRole = function (name, mentionable, permissions) {
        console.log("Creating role " + name + "...");
        return _discordJsGuildObject.roles.create({
            data: {
                name: name,
                mentionable: mentionable,
                permissions: permissions
            }
        })
            .then(function (role) {
            console.log("Role created.");
            return Promise.resolve(role);
        });
    };
    this.createGameChannel = function (name) {
        return _this.createChannel(name, null, _this.getRecruitingCategory());
    };
    this.createGameRole = function (name) {
        return _this.createRole(name, true, null);
    };
    this.getRoleById = function (roleId) { return _discordJsGuildObject.roles.cache.get(roleId); };
    this.getChannelById = function (channelId) { return _discordJsGuildObject.channels.cache.get(channelId); };
    this.getRoleByName = function (roleName) { return _discordJsGuildObject.roles.cache.find("name", roleName); };
    this.getChannelByName = function (channelName) { return _discordJsGuildObject.channels.cache.find("name", channelName); };
    this.getDiscordJsGuildMemberById = function (memberId) { return _discordJsGuildObject.member(memberId); };
    this.getGuildMemberWrapperById = function (memberId) {
        var discordJsGuildMember = _this.getDiscordJsGuildMemberById(memberId);
        return new GuildMemberWrapper(discordJsGuildMember, _this);
    };
    this.doesBotHavePermission = function (permissionFlag) {
        var botGuildMemberJsObject = _this.getDiscordJsBotMemberInGuild();
        return botGuildMemberJsObject.permissions.has(permissionFlag);
    };
    function _clearChannel(channel) {
        //deletes the last 100 messages in the channel. This is the max
        //value accepted but it should be enough.
        return channel.bulkDelete(100, true);
    }
}
//# sourceMappingURL=guild_wrapper.js.map