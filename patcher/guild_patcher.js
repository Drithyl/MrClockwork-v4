
const fs = require("fs");
const path = require("path");
const log = require("../logger.js");
const assert = require("../asserter.js");
const config = require("../config/config.json");
const guildDataStore = require("../discord/guild_data_store.js");

const V3_GUILD_DATA_FILEPATH = path.resolve(config.dataPath, "v3_guild_data.json");

/**
 * This module will import the v3_guild_data.json file from the data folder whenever
 * it is required. It will iterate through the old v3 data, where each key is a guild
 * id, and add the channel ids of that guild in the guild data store. If the bot is
 * in that guild, then the guild data store should already contain the relevant guild
 * wrapper, as they are loaded when the bot first initialized.
 */


module.exports = () =>
{
    if (fs.existsSync( V3_GUILD_DATA_FILEPATH ) === false)
        return log.general(log.getLeanLevel(), `No v3 guild data to patch found; skipping`);

    const v3GuildData = require(V3_GUILD_DATA_FILEPATH);

    v3GuildData.forEachItem((v3GuildData, id) =>
    {
        log.general(log.getLeanLevel(), `V3 guild data found for guild with id ${id}`);
        
        if (guildDataStore.hasGuildData(id) === false)
            log.general(log.getLeanLevel(), `Guild with id ${id} is not found in the guild data store; skipping`);

        else _addGuildData(v3GuildData);
    });
};


function _addGuildData(v3GuildData)
{
    log.general(log.getLeanLevel(), `Attempting to import v3 guild data for guild ${guildId}...`);

    if (assert.isValidDiscordId(v3GuildData.newsChannelID) === true)
    {
        guildDataStore.setNewsChannelId(guildId, v3GuildData.newsChannelID);
        log.general(log.getLeanLevel(), `Imported news channel.`);
    }

    if (assert.isValidDiscordId(v3GuildData.helpChannelID) === true)
    {
        guildDataStore.setHelpChannelId(guildId, v3GuildData.helpChannelID);
        log.general(log.getLeanLevel(), `Imported help channel.`);
    }

    if (assert.isValidDiscordId(v3GuildData.gameCategoryID) === true)
    {
        guildDataStore.setGameCategoryId(guildId, v3GuildData.gameCategoryID);
        log.general(log.getLeanLevel(), `Imported game category.`);
    }

    if (assert.isValidDiscordId(v3GuildData.blitzCategoryID) === true)
    {
        guildDataStore.setBlitzCategoryId(guildId, v3GuildData.blitzCategoryID);
        log.general(log.getLeanLevel(), `Imported blitz category.`);
    }

        
    if (v3GuildData.roles == null)
        return;

    if (assert.isValidDiscordId(v3GuildData.roles.blitzerID) === true)
    {
        guildDataStore.setBlitzerRoleId(guildId, v3GuildData.roles.blitzerID);
        log.general(log.getLeanLevel(), `Imported blitzer role.`);
    }

    if (assert.isValidDiscordId(v3GuildData.roles.gameMasterID) === true)
    {
        guildDataStore.setGameMasterRoleId(guildId, v3GuildData.roles.gameMasterID);
        log.general(log.getLeanLevel(), `Imported game master role.`);
    }

    if (assert.isValidDiscordId(v3GuildData.roles.trustedID) === true)
    {
        guildDataStore.setTrustedRoleId(guildId, v3GuildData.roles.trustedID);
        log.general(log.getLeanLevel(), `Imported trusted role.`);
    }
}