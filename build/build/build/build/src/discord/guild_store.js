"use strict";
var _this = this;
var config = require("../config/config.json");
var guildDataStore = require("./guild_data_store.js");
var guildWrapperFactory = require("./guild_wrapper_factory.js");
var botClientWrapper = require("./wrappers/bot_client_wrapper.js");
var guildWrappers = {};
module.exports.populateStore = function (discordJsGuildCollection) {
    return guildDataStore.populateGuildDataStore()
        .then(function () {
        var guildArray = discordJsGuildCollection.array();
        console.log("Finished loading guild data.");
        console.log("Populating guild store...");
        return guildArray.forEachPromise(function (discordJsGuild, index, nextPromise) {
            console.log("Fetching guild...");
            return discordJsGuild.fetch()
                .then(function (fetchedDiscordJsGuild) {
                module.exports.addGuild(fetchedDiscordJsGuild);
                console.log(discordJsGuild.name + " added.");
                nextPromise();
            });
        });
    });
};
module.exports.getGuildWrapperById = function (guildId) {
    return guildWrappers[guildId];
};
module.exports.getGuildClientData = function (userId) {
    var guildData = [];
    for (var id in guildWrappers) {
        var guild = guildWrappers[id];
        var id = guild.getId();
        var name = guild.getName();
        var member = guild.getGuildMemberWrapperById(userId);
        if (guild.memberHasTrustedRole(member) === true || guild.memberHasGameMasterRole(member) === true || guild.memberIsOwner(userId) === true)
            guildData.push({ id: id, name: name });
    }
    return guildData;
};
module.exports.hasGuildWrapper = function (guildId) {
    return guildWrappers[guildId] != null;
};
module.exports.forEachGuild = function (fnToCall) {
    for (var id in guildWrappers) {
        fnToCall(guildWrappers[id]);
    }
};
module.exports.forEachGuildAsync = function (promiseToCall) {
    return guildWrappers.forEachPromise(function (guildWrapper, index, nextPromise) {
        return promiseToCall(guildWrapper, index, nextPromise)
            .then(function () { return nextPromise(); });
    });
};
module.exports.addGuild = function (discordJsGuild) {
    var guildWrapper = guildWrapperFactory.wrapDiscordJsGuild(discordJsGuild);
    var guildId = guildWrapper.getId();
    guildWrappers[guildId] = guildWrapper;
};
exports.deployBotOnGuild = function (guildId) {
    var botId = botClientWrapper.getId();
    var guildWrapper = _this.getGuildWrapperById(guildId);
    var gameMasterRoleId = guildDataStore.getGameMasterRoleId(guildId);
    var trustedRoleId = guildDataStore.getTrustedRoleId(guildId);
    var blitzerRoleId = guildDataStore.getBlitzerRoleId(guildId);
    var newsChannelId = guildDataStore.getNewsChannelId(guildId);
    var helpChannelId = guildDataStore.getHelpChannelId(guildId);
    var recruitingCategoryId = guildDataStore.getRecruitingCategoryId(guildId);
    var blitzRecruitingCategoryId = guildDataStore.getBlitzRecruitingCategoryId(guildId);
    var gameCategoryId = guildDataStore.getGameCategoryId(guildId);
    var blitzCategoryId = guildDataStore.getBlitzCategoryId(guildId);
    return guildWrapper.findOrCreateRole(gameMasterRoleId, config.gameMasterRoleName, true, guildDataStore.getGameMasterRolePermissionOverwrites())
        .then(function (role) { return guildDataStore.setGameMasterRoleId(guildId, role.id); })
        .then(function () { return guildWrapper.findOrCreateRole(trustedRoleId, config.trustedRoleName, false, guildDataStore.getTrustedRolePermissionOverwrites()); })
        .then(function (role) { return guildDataStore.setTrustedRoleId(guildId, role.id); })
        .then(function () { return guildWrapper.findOrCreateRole(blitzerRoleId, config.blitzerRoleName, true, guildDataStore.getBlitzerRolePermissionOverwrites()); })
        .then(function (role) { return guildDataStore.setBlitzerRoleId(guildId, role.id); })
        .then(function () {
        return guildWrapper.findOrCreateChannel(newsChannelId, config.newsChannelName, [
            {
                id: guildId,
                deny: guildDataStore.getNewsChannelMemberPermissionOverwrites("deny"),
                allow: guildDataStore.getNewsChannelMemberPermissionOverwrites("allow")
            },
            {
                id: botId,
                deny: guildDataStore.getNewsChannelBotPermissionOverwrites("deny"),
                allow: guildDataStore.getNewsChannelBotPermissionOverwrites("allow")
            }
        ]);
    })
        .then(function (channel) { return guildDataStore.setNewsChannelId(guildId, channel.id); })
        .then(function () {
        return guildWrapper.findOrCreateChannel(helpChannelId, config.helpChannelName, [
            {
                id: guildId,
                deny: guildDataStore.getHelpChannelMemberPermissionOverwrites("deny"),
                allow: guildDataStore.getHelpChannelMemberPermissionOverwrites("allow")
            },
            {
                id: botId,
                deny: guildDataStore.getHelpChannelBotPermissionOverwrites("deny"),
                allow: guildDataStore.getHelpChannelBotPermissionOverwrites("allow")
            }
        ]);
    })
        .then(function (channel) { return guildDataStore.setHelpChannelId(guildId, channel.id); })
        .then(function () {
        return guildWrapper.findOrCreateCategory(recruitingCategoryId, config.recruitingCategoryName, [
            {
                id: guildId,
                deny: guildDataStore.getRecruitingCategoryMemberPermissionOverwrites("deny"),
                allow: guildDataStore.getRecruitingCategoryMemberPermissionOverwrites("allow")
            },
            {
                id: botId,
                deny: guildDataStore.getRecruitingCategoryBotPermissionOverwrites("deny"),
                allow: guildDataStore.getRecruitingCategoryBotPermissionOverwrites("allow")
            }
        ]);
    })
        .then(function (category) { return guildDataStore.setRecruitingCategoryId(guildId, category.id); })
        .then(function () {
        return guildWrapper.findOrCreateCategory(blitzRecruitingCategoryId, config.blitzRecruitingCategoryName, [
            {
                id: guildId,
                deny: guildDataStore.getBlitzRecruitingCategoryMemberPermissionOverwrites("deny"),
                allow: guildDataStore.getBlitzRecruitingCategoryMemberPermissionOverwrites("allow")
            },
            {
                id: botId,
                deny: guildDataStore.getBlitzRecruitingCategoryBotPermissionOverwrites("deny"),
                allow: guildDataStore.getBlitzRecruitingCategoryBotPermissionOverwrites("allow")
            }
        ]);
    })
        .then(function (category) { return guildDataStore.setBlitzRecruitingCategoryId(guildId, category.id); })
        .then(function () {
        return guildWrapper.findOrCreateCategory(gameCategoryId, config.gameCategoryName, [
            {
                id: guildId,
                deny: guildDataStore.getGameCategoryMemberPermissionOverwrites("deny"),
                allow: guildDataStore.getGameCategoryMemberPermissionOverwrites("allow")
            },
            {
                id: botId,
                deny: guildDataStore.getGameCategoryBotPermissionOverwrites("deny"),
                allow: guildDataStore.getGameCategoryBotPermissionOverwrites("allow")
            }
        ]);
    })
        .then(function (category) { return guildDataStore.setGameCategoryId(guildId, category.id); })
        .then(function () {
        return guildWrapper.findOrCreateCategory(blitzCategoryId, config.blitzCategoryName, [
            {
                id: guildId,
                deny: guildDataStore.getBlitzCategoryMemberPermissionOverwrites("deny"),
                allow: guildDataStore.getBlitzCategoryMemberPermissionOverwrites("allow")
            },
            {
                id: botId,
                deny: guildDataStore.getBlitzCategoryBotPermissionOverwrites("deny"),
                allow: guildDataStore.getBlitzCategoryBotPermissionOverwrites("allow")
            }
        ]);
    })
        .then(function (category) { return guildDataStore.setBlitzCategoryId(guildId, category.id); });
};
exports.updateHelpChannels = function (updatedHelpString, idOfGuildToUpdate) {
    if (idOfGuildToUpdate === void 0) {
        idOfGuildToUpdate = "";
    }
    var guildToUpdate = _this.getGuildWrapperById(idOfGuildToUpdate);
    if (guildToUpdate != null)
        return guildToUpdate.updateHelpChannel(updatedHelpString);
    else {
        return _this.forEachGuildAsync(function (guildWrapper, index, next) {
            return guildWrapper.updateHelpChannel(updatedHelpString)
                .then(function () { return next(); })
                .catch(function (err) {
                console.log("Error updating " + guildWrapper.getName() + ": " + err.message);
                return next();
            });
        });
    }
};
//# sourceMappingURL=guild_store.js.map