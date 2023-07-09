
const fs = require("fs");
const path = require("path");
const fsp = require("fs").promises;
const log = require("../logger.js");
const config = require("../config/config.json");
const rw = require("../reader_writer.js");
const assert = require("../asserter.js");

const GAME_DATA_DIR = path.resolve(config.dataPath, config.gameDataFolder);
const PLAYER_DATA_DIR = path.resolve(config.dataPath, config.playerDataFolder);

if (Array.prototype.forAllPromises == null)
    require("../helper_functions.js").extendPrototypes();

/**
 * The patcher module will check the games' data path for game files that seem
 * like games from the v3 bot. If it finds any, it will patch them up to be
 * compatible with the v4 format, and run them normally. The .version property
 * will be set to "4" on the first loading of the patched up game data files,
 * through the toJSONSuper() method of the game.js prototype.
 */

module.exports = async () =>
{
    const failed = [];
    const success = [];
    const filePaths = await rw.walkDir(GAME_DATA_DIR);
    
    await filePaths.forEachPromise(async (dataPath, i, nextPromise) =>
    {
        let jsonData;
        let patchedJson;

        log.general(log.getLeanLevel(), `Checking possible game file to patch at ${dataPath}...`);
        const stat = await fsp.stat(dataPath);

        if (stat.isDirectory() === true || path.extname(dataPath) !== ".json")
            return nextPromise();

        
        log.general(log.getLeanLevel(), `Game data found, reading json...`);
        jsonData = require(dataPath);

        if (jsonData.version === "4" || jsonData.needsPatching === true)
            return nextPromise();

        log.general(log.getLeanLevel(), `Read v3 game data: ${jsonData.name}; patching it to v4...`);
        
        try
        {
            patchedJson = await _patchV3Game(jsonData);
            await fsp.writeFile(dataPath, rw.JSONStringify(patchedJson));
            log.general(log.getLeanLevel(), `${jsonData.name} was patched successfully.`);
            success.push(jsonData.name);
            return nextPromise();
        }

        catch(err)
        {
            log.error(log.getLeanLevel(), `Error while patching ${jsonData.name}:`, err);
            failed.push(`${jsonData.name}:${"".width(34)}${err.message}`);
            return nextPromise();
        }
    });


    log.general(log.getLeanLevel(), `\n\nTotal games:\t${failed.length + success.length}\n\nSuccessful:\t${success.length}\nFailed:\t\t${failed.length}`);

    await fsp.writeFile("./failed_patching.txt", failed.join("\n"));
    await fsp.writeFile("./success_patching.txt", success.join("\n"));
};

async function _patchV3Game(jsonData)
{
    const v4Data = {
        needsPatching: true,
        settings: {}, 
        status: {}
    };

    try
    {
        _assertAndAssign(v4Data, "name", jsonData.name, assert.isStringOrThrow);
        _assertAndAssign(v4Data, "port", +jsonData.port, assert.isIntegerOrThrow);
        _assertAndAssign(v4Data, "serverId", jsonData.serverToken, assert.isStringOrThrow);
        _assertAndAssign(v4Data, "organizerId", jsonData.organizer, (value) => 
        {
            if (assert.isString(value) === false && value != null)
                throw new Error(`Expected String or null, got: <${value}> (${typeof value})`);
        });
        
        _assertAndAssign(v4Data, "guildId", jsonData.guild, assert.isStringOrThrow);
        _assertAndAssign(v4Data, "channelId", jsonData.channel);
        _assertAndAssign(v4Data, "roleId", jsonData.role);
        _assertAndAssign(v4Data, "isEnforcingTimer", true);
        _assertAndAssign(v4Data, "isCurrentTurnRollback", true);
        _assertAndAssign(v4Data, "playerData", []);

        _assertAndAssign(v4Data.settings, "name", jsonData.name, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "map", jsonData.settings.map, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "mods", jsonData.settings.mods);
        _assertAndAssign(v4Data.settings, "era", jsonData.settings.era, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "aiNations", jsonData.settings.aiNations);
        _assertAndAssign(v4Data.settings, "defaultAiLevel", jsonData.settings.defaultAILevel, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "artifactForging", jsonData.settings.artifactForging, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "ascensionPoints", +jsonData.settings.ap, assert.isIntegerOrThrow);
        _assertAndAssign(v4Data.settings, "cataclysm", jsonData.settings.cataclysm, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "disciples", jsonData.settings.disciples, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "eventRarity", jsonData.settings.eventRarity, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "globalSlots", jsonData.settings.globalSlots, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "goldModifier", jsonData.settings.gold, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "resourcesModifier", jsonData.settings.resources, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "suppliesModifier", jsonData.settings.supplies, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "recruitmentModifier", jsonData.settings.recruitment, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "hallOfFame", jsonData.settings.hallOfFame, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "independentsStrength", jsonData.settings.indieStrength, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "magicSites", jsonData.settings.magicSites, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "masterPassword", jsonData.settings.masterPassword, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "researchSpeed", jsonData.settings.research, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "scoregraphs", jsonData.settings.scoregraphs, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "startingProvinces", jsonData.settings.startingProvinces, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "startingResearch", jsonData.settings.startingResearch, assert.isStringOrThrow);
        _assertAndAssign(v4Data.settings, "storyEvents", jsonData.settings.storyEvents, assert.isStringOrThrow);

        _assertAndAssign(v4Data.settings, "thrones", [
            +jsonData.settings.level1Thrones,
            +jsonData.settings.level2Thrones,
            +jsonData.settings.level3Thrones
            
        ], assert.isArrayOrThrow);

        _assertAndAssign(v4Data.settings, "timer", jsonData.settings.defaultTimer, assert.isObjectOrThrow);
        
        if (assert.isObject(jsonData.players) === false)
            return v4Data;

        await jsonData.players.forAllPromises(async (oldPlayerData, playerId) =>
        {
            await _patchPlayerData(oldPlayerData, playerId);

            if (v4Data.playerData.includes(playerId) === false)
                v4Data.playerData.push(playerId);
        });

        return v4Data;
    }

    catch(err)
    {
        log.error(log.getLeanLevel(), `v3Patcher - ${jsonData.name}: Error when converting data`, err);
        throw err;
    }
}

function _assertAndAssign(obj, key, value, assertFn)
{
    try
    {
        if (assert.isFunction(assertFn))
            assertFn(value);

        else if (assert.isArray(assertFn) === true)
            assertFn.forEach((fn) => fn(value));

        obj[key] = value;
    }

    catch(err)
    {
        throw new Error(`${key} setting: ${err.message}`);
    }
}


async function _patchPlayerData(oldPlayerData, playerId)
{
    const prefsPath = `${PLAYER_DATA_DIR}/${playerId}.json`;
    const newPlayerData = _buildNewPlayerData(oldPlayerData, playerId);
    await fsp.writeFile(prefsPath, rw.JSONStringify(newPlayerData));
}

function _buildNewPlayerData(oldPlayerData, playerId)
{
    const gameName = oldPlayerData.gameName;
    const prefsJsonData = _getExistingv4PlayerData(playerId, gameName);
    const newGameData = prefsJsonData.gameDataByGameName;

    if (newGameData[gameName] == null)
        newGameData[gameName] = {
            playerId,
            reminders: oldPlayerData.reminders ?? [],
            receiveScores: oldPlayerData.isReceivingScoreDumps ?? false,
            receiveBackups: oldPlayerData.isReceivingBackups ?? false,
            receiveReminderWhenTurnIsDone: false
        };

    if (assert.isObject(oldPlayerData.nation) === true)
        newGameData[gameName].controlledNations.push(oldPlayerData.nation.filename.replace(/\.2h$/i, ""));

    return prefsJsonData;
}

function _getExistingv4PlayerData(playerId, gameName)
{
    let prefsJsonData;
    const prefsPath = `${PLAYER_DATA_DIR}/${playerId}.json`;
    
    if (fs.existsSync(prefsPath) === true)
        prefsJsonData = require(prefsPath);
    
    else
    {
        prefsJsonData = {
            playerId,
            gameDataByGameName: {},
            preferencesByGameName: {
                global: {
                    playerId,
                    reminders: [],
                    receiveScores: false,
                    receiveBackups: false,
                    receiveReminderWhenTurnIsDone: false
                }
            }
        };
    }

    if (prefsJsonData.gameDataByGameName[gameName] == null)
        prefsJsonData.gameDataByGameName[gameName] = {
            playerId,
            gameName,
            controlledNations: []
        };

    return prefsJsonData;
}