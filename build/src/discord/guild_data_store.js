"use strict";
var fs = require("fs");
var fsp = require("fs").promises;
var assert = require("../asserter.js");
var rw = require("../reader_writer.js");
var config = require("../config/config.json");
var permissionOverwritesConfig = require("../json/permission_overwrites_config.json");
var loadedGuildData = {};
var newsChannelIdKey = "newsChannelId";
var helpChannelIdKey = "helpChannelId";
var recruitingCategoryIdKey = "recruitingCategoryId";
var blitzRecruitingCategoryIdKey = "blitzRecruitingCategoryId";
var gameCategoryIdKey = "gameCategoryId";
var blitzCategoryIdKey = "blitzCategoryId";
var blitzerRoleIdKey = "blitzerRoleId";
var gameMasterRoleIdKey = "gameMasterRoleId";
var trustedRoleIdKey = "trustedRoleId";
module.exports.populateGuildDataStore = function () {
    console.log("Loading guild data...");
    if (fs.existsSync(config.pathToGuildData) === false) {
        console.log("Guild data not found, creating blank directory.");
        fs.mkdirSync(config.pathToGuildData);
    }
    else {
        var guildDirs = rw.getAllDirFilenamesSync(config.pathToGuildData);
        guildDirs.forEach(function (dirName) {
            var jsonData;
            var parsedData;
            if (fs.existsSync(config.pathToGuildData + "/" + dirName + "/data.json") === false) {
                console.log("Guild data dir exists for " + dirName + ", but no data found!");
                loadedGuildData[dirName] = {};
            }
            else {
                jsonData = fs.readFileSync(config.pathToGuildData + "/" + dirName + "/data.json");
                parsedData = JSON.parse(jsonData);
                loadedGuildData[dirName] = parsedData;
                console.log("Loaded guild data for " + dirName + ".");
            }
        });
    }
    return Promise.resolve();
};
module.exports.hasGuildData = function (guildId) { return loadedGuildData[guildId] != null; };
module.exports.createGuildData = function (guildId) {
    console.log("Creating guild data...");
    var guildData = {
        newsChannelId: null,
        helpChannelId: null,
        recruitingCategoryId: null,
        blitzRecruitingCategoryId: null,
        gameCategoryId: null,
        blitzCategoryId: null,
        blitzerRoleId: null,
        gameMasterRoleId: null,
        trustedRoleId: null
    };
    loadedGuildData[guildId] = guildData;
    console.log("Guild bot data created.");
    return guildData;
};
module.exports.getNewsChannelId = function (guildId) { return _getId(guildId, newsChannelIdKey); };
module.exports.setNewsChannelId = function (guildId, id) { return _setId(guildId, newsChannelIdKey, id); };
module.exports.getNewsChannelBotPermissionOverwrites = function (allowOrDeny) { return permissionOverwritesConfig[helpChannelIdKey]["bot"][allowOrDeny]; };
module.exports.getNewsChannelMemberPermissionOverwrites = function (allowOrDeny) { return permissionOverwritesConfig[helpChannelIdKey]["members"][allowOrDeny]; };
module.exports.getHelpChannelId = function (guildId) { return _getId(guildId, helpChannelIdKey); };
module.exports.setHelpChannelId = function (guildId, id) { return _setId(guildId, helpChannelIdKey, id); };
module.exports.getHelpChannelBotPermissionOverwrites = function (allowOrDeny) { return permissionOverwritesConfig[newsChannelIdKey]["bot"][allowOrDeny]; };
module.exports.getHelpChannelMemberPermissionOverwrites = function (allowOrDeny) { return permissionOverwritesConfig[newsChannelIdKey]["members"][allowOrDeny]; };
module.exports.getRecruitingCategoryId = function (guildId) { return _getId(guildId, recruitingCategoryIdKey); };
module.exports.setRecruitingCategoryId = function (guildId, id) { return _setId(guildId, recruitingCategoryIdKey, id); };
module.exports.getRecruitingCategoryBotPermissionOverwrites = function (allowOrDeny) { return permissionOverwritesConfig[recruitingCategoryIdKey]["bot"][allowOrDeny]; };
module.exports.getRecruitingCategoryMemberPermissionOverwrites = function (allowOrDeny) { return permissionOverwritesConfig[recruitingCategoryIdKey]["members"][allowOrDeny]; };
module.exports.getBlitzRecruitingCategoryId = function (guildId) { return _getId(guildId, blitzRecruitingCategoryIdKey); };
module.exports.setBlitzRecruitingCategoryId = function (guildId, id) { return _setId(guildId, blitzRecruitingCategoryIdKey, id); };
module.exports.getBlitzRecruitingCategoryBotPermissionOverwrites = function (allowOrDeny) { return permissionOverwritesConfig[blitzRecruitingCategoryIdKey]["bot"][allowOrDeny]; };
module.exports.getBlitzRecruitingCategoryMemberPermissionOverwrites = function (allowOrDeny) { return permissionOverwritesConfig[blitzRecruitingCategoryIdKey]["members"][allowOrDeny]; };
module.exports.getGameCategoryId = function (guildId) { return _getId(guildId, gameCategoryIdKey); };
module.exports.setGameCategoryId = function (guildId, id) { return _setId(guildId, gameCategoryIdKey, id); };
module.exports.getGameCategoryBotPermissionOverwrites = function (allowOrDeny) { return permissionOverwritesConfig[gameCategoryIdKey]["bot"][allowOrDeny]; };
module.exports.getGameCategoryMemberPermissionOverwrites = function (allowOrDeny) { return permissionOverwritesConfig[gameCategoryIdKey]["members"][allowOrDeny]; };
module.exports.getBlitzCategoryId = function (guildId) { return _getId(guildId, blitzCategoryIdKey); };
module.exports.setBlitzCategoryId = function (guildId, id) { return _setId(guildId, blitzCategoryIdKey, id); };
module.exports.getBlitzCategoryBotPermissionOverwrites = function (allowOrDeny) { return permissionOverwritesConfig[blitzCategoryIdKey]["bot"][allowOrDeny]; };
module.exports.getBlitzCategoryMemberPermissionOverwrites = function (allowOrDeny) { return permissionOverwritesConfig[blitzCategoryIdKey]["members"][allowOrDeny]; };
module.exports.getBlitzerRoleId = function (guildId) { return _getId(guildId, blitzerRoleIdKey); };
module.exports.setBlitzerRoleId = function (guildId, id) { return _setId(guildId, blitzerRoleIdKey, id); };
module.exports.getBlitzerRolePermissionOverwrites = function () { return permissionOverwritesConfig[blitzerRoleIdKey]; };
module.exports.getGameMasterRoleId = function (guildId) { return _getId(guildId, gameMasterRoleIdKey); };
module.exports.setGameMasterRoleId = function (guildId, id) { return _setId(guildId, gameMasterRoleIdKey, id); };
module.exports.getGameMasterRolePermissionOverwrites = function () { return permissionOverwritesConfig[gameMasterRoleIdKey]; };
module.exports.getTrustedRoleId = function (guildId) { return _getId(guildId, trustedRoleIdKey); };
module.exports.setTrustedRoleId = function (guildId, id) { return _setId(guildId, trustedRoleIdKey, id); };
module.exports.getTrustedRolePermissionOverwrites = function () { return permissionOverwritesConfig[trustedRoleIdKey]; };
function _getId(guildId, idKey) {
    if (loadedGuildData[guildId] == null || loadedGuildData[guildId][idKey] == null)
        return null;
    else
        return loadedGuildData[guildId][idKey];
}
function _setId(guildId, idKey, id) {
    if (loadedGuildData[guildId] == null)
        throw new Error("Guild " + guildId + " does not exist.");
    assert.isStringOrThrow(id);
    assert.isStringOrThrow(idKey);
    loadedGuildData[guildId][idKey] = id;
    return _saveGuildData(guildId);
}
function _saveGuildData(guildId) {
    var stringifiedData = JSON.stringify(loadedGuildData[guildId], null, 2);
    console.log("Saving data of guild " + guildId + "...");
    return Promise.resolve()
        .then(function () {
        if (fs.existsSync(config.pathToGuildData + "/" + guildId) === false) {
            console.log("Directory for guild data does not exist, creating it.");
            return fsp.mkdir(config.pathToGuildData + "/" + guildId);
        }
        else
            return Promise.resolve();
    })
        .then(function () {
        console.log("Writing data file...");
        return fsp.writeFile(config.pathToGuildData + "/" + guildId + "/data.json", stringifiedData);
    })
        .then(function () { return console.log("Data for guild " + guildId + " saved successfully."); });
}
//# sourceMappingURL=guild_data_store.js.map