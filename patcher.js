
const path = require("path");
const fsp = require("fs").promises;
const log = require("./logger.js");
const config = require("./config/config.json");
const rw = require("./reader_writer.js");
const assert = require("./asserter.js");


exports.patchV3Games = () =>
{
    const gameDataDir = path.resolve(config.dataPath, config.gameDataFolder);

    return rw.walkDir(gameDataDir)
    .then((filePaths) =>
    {
        return filePaths.forAllPromises((dataPath) =>
        {
            return fsp.stat(dataPath)
            .then((stat) =>
            {
                if (stat.isDirectory() === true || path.extname(dataPath) !== ".json")
                    return Promise.resolve();

                const jsonData = require(dataPath);

                if (jsonData.tracked == null && jsonData.gameType == null)
                    return Promise.resolve();

                log.general(log.getLeanLevel(), `Found v3 game ${jsonData.name}; patching it to v4...`);

                return _patchV3Game(jsonData)
                .then((patchedJson) => fsp.writeFile(dataPath, rw.JSONStringify(patchedJson)))
                .then(() => log.general(log.getLeanLevel(), `${jsonData.name} was patched successfully.`))
                .catch((err) => Promise.reject(err));
            });
        })
    })
};

function _patchV3Game(jsonData)
{
    const v4Data = {
        needsPatching: true,
        settings: {}, 
        status: {}
    };

    try
    {
        console.log("WHOS HERE", jsonData.name);
        _assertAndAssign(v4Data, "name", jsonData.name, assert.isStringOrThrow);
        _assertAndAssign(v4Data, "port", +jsonData.port, assert.isIntegerOrThrow);
        _assertAndAssign(v4Data, "serverId", jsonData.serverToken, assert.isStringOrThrow);
        _assertAndAssign(v4Data, "organizerId", jsonData.organizer, assert.isStringOrThrow);
        _assertAndAssign(v4Data, "guildId", jsonData.guild, assert.isStringOrThrow);
        _assertAndAssign(v4Data, "channelId", jsonData.channel);
        _assertAndAssign(v4Data, "roleId", jsonData.role);
        _assertAndAssign(v4Data, "isEnforcingTimer", true);
        _assertAndAssign(v4Data, "isCurrentTurnRollback", true);
        _assertAndAssign(v4Data, "playerData", []);

        _assertAndAssign(v4Data.settings, "name", jsonData.name, assert.isStringOrThrow);

        if (path.extname(jsonData.settings.map) !== ".map")
            return log.general(log.getLeanLevel(), `v3Patcher - ${jsonData.name}: map is random; skipping`);

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

        return Promise.resolve(v4Data);
    }

    catch(err)
    {
        log.error(log.getLeanLevel(), `v3Patcher - ${jsonData.name}: Error when converting data`, err);
        throw err;
    }
}

function _assertAndAssign(obj, key, value, assertFn)
{
    if (assert.isFunction(assertFn))
        assertFn(value);

    else if (assert.isArray(assertFn) === true)
        assertFn.forEach((fn) => fn(value));

    obj[key] = value;
}