
const fs = require("fs");
const path = require("path");
const log = require("../logger.js");
const assert = require("../asserter.js");
const guildDataStore = require("./guild_data_store.js");
var v3GuildData;

if (fs.existsSync( path.resolve(__dirname, "../data/v3_guild_data.json") ) === false)
    return log.general(log.getLeanLevel(), `No v3 guild data to import found.`);

else v3GuildData = require("../data/v3_guild_data.json");

module.exports.importV3GuildData = (guildId) =>
{
    if (v3GuildData == null)
        return;

    const importedData = v3GuildData[guildId];
    log.general(log.getLeanLevel(), `Attempting to import v3 guild data for guild ${guildId}...`);

    if (importedData == null)
        return log.general(log.getLeanLevel(), `v3 guild data does not exist.`);

    log.general(log.getLeanLevel(), `v3 guild data exists. Importing it...`);

    if (assert.isValidDiscordId(importedData.newsChannelID) === true)
    {
        guildDataStore.setNewsChannelId(guildId, importedData.newsChannelID);
        log.general(log.getLeanLevel(), `Imported news channel.`);
    }

    if (assert.isValidDiscordId(importedData.helpChannelID) === true)
    {
        guildDataStore.setHelpChannelId(guildId, importedData.helpChannelID);
        log.general(log.getLeanLevel(), `Imported help channel.`);
    }

    if (assert.isValidDiscordId(importedData.gameCategoryID) === true)
    {
        guildDataStore.setGameCategoryId(guildId, importedData.gameCategoryID);
        log.general(log.getLeanLevel(), `Imported game category.`);
    }

    if (assert.isValidDiscordId(importedData.blitzCategoryID) === true)
    {
        guildDataStore.setBlitzCategoryId(guildId, importedData.blitzCategoryID);
        log.general(log.getLeanLevel(), `Imported blitz category.`);
    }

        
    if (importedData.roles == null)
        return;

    if (assert.isValidDiscordId(importedData.roles.blitzerID) === true)
    {
        guildDataStore.setBlitzerRoleId(guildId, importedData.roles.blitzerID);
        log.general(log.getLeanLevel(), `Imported blitzer role.`);
    }

    if (assert.isValidDiscordId(importedData.roles.gameMasterID) === true)
    {
        guildDataStore.setGameMasterRoleId(guildId, importedData.roles.gameMasterID);
        log.general(log.getLeanLevel(), `Imported game master role.`);
    }

    if (assert.isValidDiscordId(importedData.roles.trustedID) === true)
    {
        guildDataStore.setTrustedRoleId(guildId, importedData.roles.trustedID);
        log.general(log.getLeanLevel(), `Imported trusted role.`);
    }

    
};


