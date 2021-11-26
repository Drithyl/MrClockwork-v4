
const fs = require("fs");
const path = require("path");
const log = require("../logger.js");
const assert = require("../asserter.js");
const config = require("../config/config.json");

const V3_GUILD_DATA_FILEPATH = path.resolve(config.dataPath, "v3_guild_data.json");
const GUILD_DATA_DIR = path.resolve(config.dataPath, config.guildDataFolder);

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

    v3GuildData.forEachItem((data, id) =>
    {
        log.general(log.getLeanLevel(), `V3 guild data found for guild with id ${id}`);
        _addGuildData(data);
    });

    fs.unlinkSync(V3_GUILD_DATA_FILEPATH);
};


function _addGuildData(v3GuildData)
{
    const guildId = v3GuildData.id;
    const patchedData = { guildId };
    log.general(log.getLeanLevel(), `Attempting to import v3 guild data for guild ${guildId}...`);

    if (assert.isValidDiscordId(v3GuildData.newsChannelID) === true)
    {
        patchedData.newsChannelId = v3GuildData.newsChannelID;
        log.general(log.getLeanLevel(), `Imported news channel.`);
    }

    if (assert.isValidDiscordId(v3GuildData.helpChannelID) === true)
    {
        patchedData.helpChannelId = v3GuildData.helpChannelID;
        log.general(log.getLeanLevel(), `Imported help channel.`);
    }

    if (assert.isValidDiscordId(v3GuildData.gameCategoryID) === true)
    {
        patchedData.gameCategoryId = v3GuildData.gameCategoryID;
        log.general(log.getLeanLevel(), `Imported game category.`);
    }

    if (assert.isValidDiscordId(v3GuildData.blitzCategoryID) === true)
    {
        patchedData.blitzCategoryId = v3GuildData.blitzCategoryID;
        log.general(log.getLeanLevel(), `Imported blitz category.`);
    }

        
    if (v3GuildData.roles != null)
    {
        if (assert.isValidDiscordId(v3GuildData.roles.blitzerID) === true)
        {
            patchedData.blitzerRoleId = v3GuildData.roles.blitzerID;
            log.general(log.getLeanLevel(), `Imported blitzer role.`);
        }
    
        if (assert.isValidDiscordId(v3GuildData.roles.gameMasterID) === true)
        {
            patchedData.gameMasterRoleId = v3GuildData.roles.gameMasterID;
            log.general(log.getLeanLevel(), `Imported game master role.`);
        }
    
        if (assert.isValidDiscordId(v3GuildData.roles.trustedID) === true)
        {
            patchedData.trustedRoleId = v3GuildData.roles.trustedID;
            log.general(log.getLeanLevel(), `Imported trusted role.`);
        }
    }

    fs.mkdirSync(path.resolve(GUILD_DATA_DIR, guildId));
    fs.writeFileSync(path.resolve(GUILD_DATA_DIR, guildId, `data.json`), JSON.stringify(patchedData));
    log.general(log.getLeanLevel(), `Saved patched data`, patchedData);
}