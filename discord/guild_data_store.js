
const fs = require("fs");
const fsp = require("fs").promises;
const log = require("../logger.js");
const assert = require("../asserter.js");
const rw = require("../reader_writer.js");
const config = require("../config/config.json");
const permissionOverwritesConfig = require("../json/permission_overwrites_config.json");


const loadedGuildData = {};

const GUILD_ID_KEY = "guildId";
const GUILD_NAME_KEY = "guildName";
const NEWS_CHANNEL_ID_KEY = "newsChannelId";
const HELP_CHANNEL_ID_KEY = "helpChannelId";
const RECRUITING_CATEGORY_ID_KEY = "recruitingCategoryId";
const BLITZ_RECRUITING_CATEGORY_ID_KEY = "blitzRecruitingCategoryId";
const GAME_CATEGORY_ID_KEY = "gameCategoryId";
const BLITZ_CATEGORY_ID_KEY = "blitzCategoryId";
const BLITZER_ROLE_ID_KEY = "blitzerRoleId";
const GAME_MASTER_ROLE_ID_KEY = "gameMasterRoleId";
const TRUSTED_ROLE_ID_KEY = "trustedRoleId";


module.exports.populateGuildDataStore = () =>
{
    const guildDataPath = `${config.dataPath}/${config.guildDataFolder}`;
    log.general(log.getNormalLevel(), "Populating guild data store...");

    if (fs.existsSync(guildDataPath) === false)
    {
        log.general(log.getNormalLevel(), "Guild data not found, creating blank directory.");
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
                log.general(log.getLeanLevel(), `Guild data dir exists for ${dirName}, but no data found; probably a recently added guild.`);
                loadedGuildData[dirName] = {};
            }

            else
            {
                jsonData = fs.readFileSync(`${guildDataPath}/${dirName}/data.json`);
                parsedData = JSON.parse(jsonData);

                loadedGuildData[dirName] = parsedData;
                log.general(log.getNormalLevel(), `Loaded guild data for ${dirName}.`);
            }
        });
    }

    return Promise.resolve();
};

module.exports.hasGuildData = (guildId) => loadedGuildData[guildId] != null;
module.exports.getGuildData = (guildId) =>
{
    if (exports.hasGuildData(guildId) === false)
        return {};

    return Object.assign({}, loadedGuildData[guildId]);
};

module.exports.clearGuildData = (guildId, discordIdToClear) =>
{
    if (exports.hasGuildData(guildId) === false)
        return Promise.resolve();

    const guildData = loadedGuildData[guildId];

    for (var key in guildData)
    {
        if (guildData[key] === discordIdToClear)
        {
            delete guildData[key];
            return _saveGuildData(guildId);
        }
    }

    return Promise.resolve();
};

module.exports.createGuildData = (guildWrapper) =>
{
    log.general(log.getNormalLevel(), "Creating guild data...");
    var guildData = {
        [GUILD_ID_KEY]: guildWrapper.getId(),
        [GUILD_NAME_KEY]: guildWrapper.getName(),
        [NEWS_CHANNEL_ID_KEY]: null,
        [HELP_CHANNEL_ID_KEY]: null,
        [RECRUITING_CATEGORY_ID_KEY]: null,
        [BLITZ_RECRUITING_CATEGORY_ID_KEY]: null,
        [GAME_CATEGORY_ID_KEY]: null,
        [BLITZ_CATEGORY_ID_KEY]: null,
        [BLITZER_ROLE_ID_KEY]: null,
        [GAME_MASTER_ROLE_ID_KEY]: null,
        [TRUSTED_ROLE_ID_KEY]: null
    };

    loadedGuildData[guildWrapper.getId()] = guildData;
    log.general(log.getNormalLevel(), "Guild bot data created.");
    return guildData;
};

module.exports.removeGuildData = (guildId) =>
{
    const pathToGuildData = `${config.dataPath}/${config.guildDataFolder}`;

    log.general(log.getNormalLevel(), "Removing guild data...");
    delete loadedGuildData[guildId];

    return Promise.resolve()
    .then(() =>
    {
        if (fs.existsSync(`${pathToGuildData}/${guildId}/data.json`) === true)
            return fsp.unlink(`${pathToGuildData}/${guildId}/data.json`);

        else return Promise.resolve();
    })
    .then(() => 
    {
        if (fs.existsSync(`${pathToGuildData}/${guildId}`) === true)
            return fsp.rmdir(`${pathToGuildData}/${guildId}`);

        else return Promise.resolve();
    })
    .then(() => 
    {
        log.general(log.getNormalLevel(), `Data for guild ${guildId} removed.`);
    });
};

module.exports.getNewsChannelId = (guildId) => _getFieldId(guildId, NEWS_CHANNEL_ID_KEY);
module.exports.setNewsChannelId = (guildId, id) => _setFieldId(guildId, NEWS_CHANNEL_ID_KEY, id);
module.exports.getNewsChannelBotPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[HELP_CHANNEL_ID_KEY]["bot"][allowOrDeny];
module.exports.getNewsChannelMemberPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[HELP_CHANNEL_ID_KEY]["members"][allowOrDeny];

module.exports.getHelpChannelId = (guildId) => _getFieldId(guildId, HELP_CHANNEL_ID_KEY);
module.exports.setHelpChannelId = (guildId, id) => _setFieldId(guildId, HELP_CHANNEL_ID_KEY, id);
module.exports.getHelpChannelBotPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[NEWS_CHANNEL_ID_KEY]["bot"][allowOrDeny];
module.exports.getHelpChannelMemberPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[NEWS_CHANNEL_ID_KEY]["members"][allowOrDeny];


module.exports.getRecruitingCategoryId = (guildId) => _getFieldId(guildId, RECRUITING_CATEGORY_ID_KEY);
module.exports.setRecruitingCategoryId = (guildId, id) => _setFieldId(guildId, RECRUITING_CATEGORY_ID_KEY, id);
module.exports.getRecruitingCategoryBotPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[RECRUITING_CATEGORY_ID_KEY]["bot"][allowOrDeny];
module.exports.getRecruitingCategoryMemberPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[RECRUITING_CATEGORY_ID_KEY]["members"][allowOrDeny];

module.exports.getBlitzRecruitingCategoryId = (guildId) => _getFieldId(guildId, BLITZ_RECRUITING_CATEGORY_ID_KEY);
module.exports.setBlitzRecruitingCategoryId = (guildId, id) => _setFieldId(guildId, BLITZ_RECRUITING_CATEGORY_ID_KEY, id);
module.exports.getBlitzRecruitingCategoryBotPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[BLITZ_RECRUITING_CATEGORY_ID_KEY]["bot"][allowOrDeny];
module.exports.getBlitzRecruitingCategoryMemberPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[BLITZ_RECRUITING_CATEGORY_ID_KEY]["members"][allowOrDeny];

module.exports.getGameCategoryId = (guildId) => _getFieldId(guildId, GAME_CATEGORY_ID_KEY);
module.exports.setGameCategoryId = (guildId, id) => _setFieldId(guildId, GAME_CATEGORY_ID_KEY, id);
module.exports.getGameCategoryBotPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[GAME_CATEGORY_ID_KEY]["bot"][allowOrDeny];
module.exports.getGameCategoryMemberPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[GAME_CATEGORY_ID_KEY]["members"][allowOrDeny];

module.exports.getBlitzCategoryId = (guildId) => _getFieldId(guildId, BLITZ_CATEGORY_ID_KEY);
module.exports.setBlitzCategoryId = (guildId, id) => _setFieldId(guildId, BLITZ_CATEGORY_ID_KEY, id);
module.exports.getBlitzCategoryBotPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[BLITZ_CATEGORY_ID_KEY]["bot"][allowOrDeny];
module.exports.getBlitzCategoryMemberPermissionOverwrites = (allowOrDeny) => permissionOverwritesConfig[BLITZ_CATEGORY_ID_KEY]["members"][allowOrDeny];


module.exports.getBlitzerRoleId = (guildId) => _getFieldId(guildId, BLITZER_ROLE_ID_KEY);
module.exports.setBlitzerRoleId = (guildId, id) => _setFieldId(guildId, BLITZER_ROLE_ID_KEY, id);
module.exports.getBlitzerRolePermissionOverwrites = () => permissionOverwritesConfig[BLITZER_ROLE_ID_KEY];

module.exports.getGameMasterRoleId = (guildId) => _getFieldId(guildId, GAME_MASTER_ROLE_ID_KEY);
module.exports.setGameMasterRoleId = (guildId, id) => _setFieldId(guildId, GAME_MASTER_ROLE_ID_KEY, id);
module.exports.getGameMasterRolePermissionOverwrites = () => permissionOverwritesConfig[GAME_MASTER_ROLE_ID_KEY];

module.exports.getTrustedRoleId = (guildId) => _getFieldId(guildId, TRUSTED_ROLE_ID_KEY);
module.exports.setTrustedRoleId = (guildId, id) => _setFieldId(guildId, TRUSTED_ROLE_ID_KEY, id);
module.exports.getTrustedRolePermissionOverwrites = () => permissionOverwritesConfig[TRUSTED_ROLE_ID_KEY];


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


function _getFieldId(guildId, fieldKey)
{
    if (loadedGuildData[guildId] == null || loadedGuildData[guildId][fieldKey] == null)
        return null;

    else return loadedGuildData[guildId][fieldKey];
}

function _setFieldId(guildId, fieldKey, id)
{
    if (loadedGuildData[guildId] == null)
        throw new Error(`Guild ${guildId} does not exist.`);

    assert.isStringOrThrow(id);
    assert.isStringOrThrow(fieldKey);
    loadedGuildData[guildId][fieldKey] = id;
    return _saveGuildData(guildId);
}

function _saveGuildData(guildId)
{
    const pathToGuildData = `${config.dataPath}/${config.guildDataFolder}`;
    const stringifiedData = JSON.stringify(loadedGuildData[guildId], null, 2);

    return Promise.resolve()
    .then(() =>
    {
        if (fs.existsSync(`${pathToGuildData}/${guildId}`) === false)
        {
            log.general(log.getVerboseLevel(), `Directory for guild data does not exist, creating it.`);
            return fsp.mkdir(`${pathToGuildData}/${guildId}`);
        }

        else return Promise.resolve();
    })
    .then(() => fsp.writeFile(`${pathToGuildData}/${guildId}/data.json`, stringifiedData));
}
