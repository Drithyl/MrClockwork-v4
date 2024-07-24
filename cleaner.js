
const fs = require("fs");
const path = require("path");
const fsp = require("fs").promises;
const log = require("./logger.js");
const rw = require("./reader_writer.js");
const config = require("./config/config.json");
const ongoingGamesStore = require("./games/ongoing_games_store.js");
const { getDominionsMapsPath, getDominionsModsPath } = require("./helper_functions.js");
const { DominionsMapFile, DominionsModFile } = require("./games/prototypes/DominionsFile.js");

const UTC_DAYS_TO_CLEAN = [3, 6];
const UTC_HOUR_TO_CLEAN = 22;
const ONE_HOUR = 3600000;

const DOM5_MAP_PATH = path.resolve(getDominionsMapsPath(config.dom5GameTypeName));
const DOM5_MOD_PATH = path.resolve(getDominionsModsPath(config.dom5GameTypeName));

const DOM6_MAP_PATH = path.resolve(getDominionsMapsPath(config.dom6GameTypeName));
const DOM6_MOD_PATH = path.resolve(getDominionsModsPath(config.dom6GameTypeName));

let modsAndMapsCleaningInterval;
let isCleaningEnabled = config.isCleaningEnabled;



module.exports.toggleIsCleaningEnabled = () =>
{
    isCleaningEnabled = !isCleaningEnabled;
    log.general(log.getLeanLevel(), `isCleaningEnabled set to ${isCleaningEnabled}`);
    return isCleaningEnabled;
};

module.exports.startCleaningInterval = () =>
{
    modsAndMapsCleaningInterval = setInterval(() =>
    {
        const dateNow = new Date(Date.now());
        const currentUtcDay = dateNow.getUTCDay();
        const currentUtcHour = dateNow.getUTCHours();

        
        if (isCleaningEnabled === false)
            return log.general(log.getLeanLevel(), `isCleaningEnabled is false; skipping cleaning interval.`);

        if (UTC_DAYS_TO_CLEAN.includes(currentUtcDay) === false)
            return log.general(log.getLeanLevel(), `Current day is ${currentUtcDay}, days to clean are ${UTC_DAYS_TO_CLEAN}; skipping cleaning interval.`);

        if (currentUtcHour !== UTC_HOUR_TO_CLEAN)
            return log.general(log.getLeanLevel(), `Current hour is ${currentUtcHour}, hour to clean is ${UTC_HOUR_TO_CLEAN}; skipping cleaning interval.`);


        log.general(log.getLeanLevel(), `Process to clean unused files starting...`);
        exports.cleanUnusedMaps(true);
        exports.cleanUnusedMods(true);

    }, ONE_HOUR);
};

module.exports.cleanUnusedMaps = async (force = false) =>
{
    const dom5MapsInUse = _getListOfMapsInUse(config.dom5GameTypeName);
    const dom6MapsInUse = _getListOfMapsInUse(config.dom6GameTypeName);
    const dom5Results = await _cleanUnusedFiles(dom5MapsInUse, DOM5_MAP_PATH, force);
    const dom6Results = await _cleanUnusedFiles(dom6MapsInUse, DOM6_MAP_PATH, force);
    log.general(log.getLeanLevel(), `Dom5 map cleaning finished. Cleaned ${dom5Results.length} map files.`);
    log.general(log.getLeanLevel(), `Dom6 map cleaning finished. Cleaned ${dom6Results.length} map files.`);
    return [...dom5Results, ...dom6Results];
};

module.exports.cleanUnusedMods = async (force = false) =>
{
    const dom5ModsInUse = _getListOfModsInUse(config.dom5GameTypeName);
    const dom6ModsInUse = _getListOfModsInUse(config.dom6GameTypeName);
    const dom5Results = await _cleanUnusedFiles(dom5ModsInUse, DOM5_MOD_PATH, force);
    const dom6Results = await _cleanUnusedFiles(dom6ModsInUse, DOM6_MOD_PATH, force);
    log.general(log.getLeanLevel(), `Dom5 mod cleaning finished. Cleaned ${dom5Results.length} mod files.`);
    log.general(log.getLeanLevel(), `Dom6 mod cleaning finished. Cleaned ${dom6Results.length} mod files.`);
    return [...dom5Results, ...dom6Results];
};


function _getListOfMapsInUse(gameType)
{
    const usedMaps = [];
    const mapsDir = getDominionsMapsPath(gameType);
    const games = ongoingGamesStore.getArrayOfGames();

    games.forEach((game) =>
    {
        if (game.getType() === gameType) 
        {
            const settingsObject = game.getSettingsObject();
            const mapSetting = settingsObject.getMapSetting();
            const mapPath = path.join(mapsDir, mapSetting.getValue());

            if (fs.existsSync(mapPath) === true) {
                const mapFile = new DominionsMapFile(mapPath);
                usedMaps.push(mapFile);
            }
            
            else {
                log.general(`${game.getName()}'s mapfile does not exist: "${mapPath}"`);
            }
        }
    });

    return usedMaps;
}

function _getListOfModsInUse(gameType)
{
    const usedMods = [];
    const modsDir = getDominionsModsPath(gameType);
    const games = ongoingGamesStore.getArrayOfGames();

    games.forEach((game) =>
    {
        if (game.getType() === gameType) 
        {
            const settingsObject = game.getSettingsObject();
            const modSetting = settingsObject.getModsSetting();
            const modsInUse = modSetting.getValue();

            if (Array.isArray(modsInUse) === true && modsInUse.length > 0) {
                modsInUse.forEach(modName => {
                    const modPath = path.join(modsDir, modName);

                    if (fs.existsSync(modPath) === true) {
                        usedMods.push(new DominionsModFile(modPath));
                    }
            
                    else {
                        log.general(`${game.getName()}'s modfile does not exist: "${modPath}"`);
                    }
                });
            }
        }
    });

    return usedMods;
}

async function _cleanUnusedFiles(filesInUse, dirPath, force = false)
{
    const allDependenciesInUse = [];
    const deletedFiles = [];

    log.general(log.getLeanLevel(), `Begin cleaning unused files...`);

    for (const domFile of filesInUse) {
        log.general(log.getLeanLevel(), `Searching all dependencies of ${domFile.filename}...`);
        const dependencies = await domFile.parseDependencies();
        log.general(log.getLeanLevel(), `Found ${dependencies.size} related files`);
        allDependenciesInUse.push(domFile.path, ...Array.from(dependencies));
    }

    const existingFiles = await rw.walkDir(dirPath);
    const existingFilesSet = existingFiles;
    const usedFilesSet = allDependenciesInUse;
    const unusedFiles = existingFilesSet.filter(x => !usedFilesSet.includes(x));

    for (const unusedFile of unusedFiles) {
        try {
            if (force === true) {
                await fsp.unlink(unusedFile);
                log.general(log.getLeanLevel(), `Deleted file "${unusedFile}"`);
            }
    
            deletedFiles.push(unusedFile);
        }
        
        catch(err) {
            log.general(log.getLeanLevel(), `Failed to delete file ${unusedFile}`, err);
        }
    }

    return deletedFiles;
}
