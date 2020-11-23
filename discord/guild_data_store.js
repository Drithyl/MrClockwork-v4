
const fs = require("fs");
const fsp = require("fs").promises;
const assert = require("../asserter.js");
const rw = require("../reader_writer.js");
const config = require("../config/config.json");
const permissionOverwritesConfig = require("../json/permission_overwrites_config.json");

const loadedGuildData = {};

var newsChannelIdKey = "newsChannelId";
var helpChannelIdKey = "helpChannelId";
var recruitingCategoryIdKey = "recruitingCategoryId";
var blitzRecruitingCategoryIdKey = "blitzRecruitingCategoryId";
var gameCategoryIdKey = "gameCategoryId";
var blitzCategoryIdKey = "blitzCategoryId";
var blitzerRoleIdKey = "blitzerRoleId";
var gameMasterRoleIdKey = "gameMasterRoleId";
var trustedRoleIdKey = "trustedRoleId";

module.exports.populateGuildDataStore = () =>
{
    const guildDataPath = `${config.dataPath}/${config.guildDataFolder}`;
    console.log("Loading guild data...");

    if (fs.existsSync(guildDataPath) === false)
    {
        console.log("Guild data not found, creating blank directory.");
        fs.mkdirSync(guildDataPath);
    }

    else
    {
        var guildDirs = rw.getAllDirFilenamesSync(guildDataPath);

        guildDirs.forEach((dirName) =>
        {
            var jsonData;
            var parsedData;

            if (fs.existsSync(`${guildDataPath}/${dirName}/data.json`) === false)
            {
                console.log(`Guild data dir exists for ${dirName}, but no data found!`);
                loadedGuildData[dirName] = {};
            }

            else
            {
                jsonData = fs.readFileSync(`${guildDataPath}/${dirName}/data.json`);
                parsedData = JSON.parse(jsonData);

                loadedGuildData[dirName] = parsedData;
                console.log(`Loaded guild data for ${dirName}.`);
            }
        });
    }

    return Promise.resolve();
};

module.exports.hasGuildData = (guildId) => loadedGuildData[guildId] != null;

module.exports.createGuildData = (guildId) =>
{
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


module.exports.getNewsChannelId = (guildId) => _getId(guildId, newsChannelIdKey);
module.exports.setNewsChannelId = (guildId, id) => _setId(guildId, newsChannelIdKey, id);
module.exports.getNewsChannelBotPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[helpChannelIdKey]["bot"][allowOrDeny];
module.exports.getNewsChannelMemberPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[helpChannelIdKey]["members"][allowOrDeny];

module.exports.getHelpChannelId = (guildId) => _getId(guildId, helpChannelIdKey);
module.exports.setHelpChannelId = (guildId, id) => _setId(guildId, helpChannelIdKey, id);
module.exports.getHelpChannelBotPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[newsChannelIdKey]["bot"][allowOrDeny];
module.exports.getHelpChannelMemberPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[newsChannelIdKey]["members"][allowOrDeny];


module.exports.getRecruitingCategoryId = (guildId) => _getId(guildId, recruitingCategoryIdKey);
module.exports.setRecruitingCategoryId = (guildId, id) => _setId(guildId, recruitingCategoryIdKey, id);
module.exports.getRecruitingCategoryBotPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[recruitingCategoryIdKey]["bot"][allowOrDeny];
module.exports.getRecruitingCategoryMemberPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[recruitingCategoryIdKey]["members"][allowOrDeny];

module.exports.getBlitzRecruitingCategoryId = (guildId) => _getId(guildId, blitzRecruitingCategoryIdKey);
module.exports.setBlitzRecruitingCategoryId = (guildId, id) => _setId(guildId, blitzRecruitingCategoryIdKey, id);
module.exports.getBlitzRecruitingCategoryBotPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[blitzRecruitingCategoryIdKey]["bot"][allowOrDeny];
module.exports.getBlitzRecruitingCategoryMemberPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[blitzRecruitingCategoryIdKey]["members"][allowOrDeny];

module.exports.getGameCategoryId = (guildId) => _getId(guildId, gameCategoryIdKey);
module.exports.setGameCategoryId = (guildId, id) => _setId(guildId, gameCategoryIdKey, id);
module.exports.getGameCategoryBotPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[gameCategoryIdKey]["bot"][allowOrDeny];
module.exports.getGameCategoryMemberPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[gameCategoryIdKey]["members"][allowOrDeny];

module.exports.getBlitzCategoryId = (guildId) => _getId(guildId, blitzCategoryIdKey);
module.exports.setBlitzCategoryId = (guildId, id) => _setId(guildId, blitzCategoryIdKey, id);
module.exports.getBlitzCategoryBotPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[blitzCategoryIdKey]["bot"][allowOrDeny];
module.exports.getBlitzCategoryMemberPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[blitzCategoryIdKey]["members"][allowOrDeny];


module.exports.getBlitzerRoleId = (guildId) => _getId(guildId, blitzerRoleIdKey);
module.exports.setBlitzerRoleId = (guildId, id) => _setId(guildId, blitzerRoleIdKey, id);
module.exports.getBlitzerRolePermissionOverwrites = () => permissionOverwritesConfig[blitzerRoleIdKey];

module.exports.getGameMasterRoleId = (guildId) => _getId(guildId, gameMasterRoleIdKey);
module.exports.setGameMasterRoleId = (guildId, id) => _setId(guildId, gameMasterRoleIdKey, id);
module.exports.getGameMasterRolePermissionOverwrites = () => permissionOverwritesConfig[gameMasterRoleIdKey];

module.exports.getTrustedRoleId = (guildId) => _getId(guildId, trustedRoleIdKey);
module.exports.setTrustedRoleId = (guildId, id) => _setId(guildId, trustedRoleIdKey, id);
module.exports.getTrustedRolePermissionOverwrites = () => permissionOverwritesConfig[trustedRoleIdKey];


module.exports.replaceRoleWithNew = (guildId, oldRoleId, newRoleId) =>
{
    var wasChanged = false;
    const guildData = loadedGuildData[guildId];

    assert.isValidDiscordIdOrThrow(newRoleId);

    if (guildData == null)
        return Promise.reject(new Error(`Incorrect guild id provided.`));

    for (var key in guildData)
    {
        const discordId = guildData[key];

        if (discordId === oldRoleId)
        {
            guildData[key] = newRoleId;
            wasChanged = true;
        }
    }

    if (wasChanged === true)
        return _saveGuildData(guildId);

    else return Promise.resolve();
};


function _getId(guildId, idKey)
{
    if (loadedGuildData[guildId] == null || loadedGuildData[guildId][idKey] == null)
        return null;

    else return loadedGuildData[guildId][idKey];
}

function _setId(guildId, idKey, id)
{
    if (loadedGuildData[guildId] == null)
        throw new Error(`Guild ${guildId} does not exist.`);

    assert.isStringOrThrow(id);
    assert.isStringOrThrow(idKey);
    loadedGuildData[guildId][idKey] = id;
    return _saveGuildData(guildId);
}

function _saveGuildData(guildId)
{
    const pathToGuildData = `${config.dataPath}/${config.guildDataFolder}`;
    const stringifiedData = JSON.stringify(loadedGuildData[guildId], null, 2);

    console.log(`Saving data of guild ${guildId}...`);
    return Promise.resolve()
    .then(() =>
    {
        if (fs.existsSync(`${pathToGuildData}/${guildId}`) === false)
        {
            console.log(`Directory for guild data does not exist, creating it.`);
            return fsp.mkdir(`${pathToGuildData}/${guildId}`);
        }

        else return Promise.resolve();
    })
    .then(() => 
    {
        console.log(`Writing data file...`);
        return fsp.writeFile(`${pathToGuildData}/${guildId}/data.json`, stringifiedData);
    })
    .then(() => console.log(`Data for guild ${guildId} saved successfully.`));
}
