
const fs = require("fs");
const path = require("path");
const fsp = require("fs").promises;
const log = require("./logger.js");
const rw = require("./reader_writer.js");
const config = require("./config/config.json");
const ongoingGamesStore = require("./games/ongoing_games_store.js");

const UTC_DAYS_TO_CLEAN = [3, 6];
const UTC_HOUR_TO_CLEAN = 22;
const ONE_HOUR = 3600000;

const DOM5_MAP_PATH = path.resolve(config.pathToDom5Data, "maps");
const DOM5_MOD_PATH = path.resolve(config.pathToDom5Data, "mods");

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
    try
    {
        const mapsInUse = _getListOfMapsInUse();
        const results = await _cleanUnusedFiles(mapsInUse, DOM5_MAP_PATH, force);
        log.general(log.getLeanLevel(), `Map cleaning finished. Cleaned ${results.length} map files.`);
        return results;
    }

    catch(err)
    {
        log.error(log.getLeanLevel(), `Map cleaning ERROR`, err)
    }
};

module.exports.cleanUnusedMods = async (force = false) =>
{
    try
    {
        const modsInUse = _getListOfModsInUse();
        const results = await _cleanUnusedFiles(modsInUse, DOM5_MOD_PATH, force);
        log.general(log.getLeanLevel(), `Mod cleaning finished. Cleaned ${results.length} mod files.`);
        return results;
    }

    catch(err)
    {
        log.error(log.getLeanLevel(), `Mod cleaning ERROR`, err)
    }
};


async function _cleanUnusedFiles(filesInUse, dirPath, force = false)
{
    let finalFilesInUse = [];
    
    if (Array.isArray(filesInUse) === false)
        return Promise.reject(new Error(`Expected filesInUse to be an array, got ${typeof filesInUse} instead.`), []);

    log.general(log.getLeanLevel(), `Begin cleaning unused files...`);

    try
    {
        const relatedFiles = await _getListOfRelatedFilesInUse(filesInUse, dirPath);
        finalFilesInUse = finalFilesInUse.concat(relatedFiles);
    
        const dirFiles = await rw.walkDir(dirPath);
        const deletedFiles = await _deleteUnusedFiles(dirFiles, finalFilesInUse, force);

        log.general(log.getLeanLevel(), `In ${dirPath}, deleted ${deletedFiles.length} unused files`);
        return deletedFiles;
    }

    catch(err)
    {
        log.general(log.getLeanLevel(), `Error occurred when deleting unused files in ${dirPath}`, err);
        return Promise.reject(err);
    };
}

function _getListOfMapsInUse()
{
    const usedMaps = [];
    const games = ongoingGamesStore.getArrayOfGames();

    games.forEach((game) =>
    {
        const settingsObject = game.getSettingsObject();
        const mapSetting = settingsObject.getMapSetting();
        usedMaps.push(mapSetting.getValue());
    });

    return usedMaps;
}

function _getListOfModsInUse()
{
    const usedMods = [];
    const games = ongoingGamesStore.getArrayOfGames();

    games.forEach((game) =>
    {
        const settingsObject = game.getSettingsObject();
        const modSetting = settingsObject.getModsSetting();
        const modsInUse = modSetting.getValue();

        if (Array.isArray(modsInUse) === true && modsInUse.length > 0)
            usedMods.push(...modSetting.getValue());
    });

    return usedMods;
}

/** uses the list of filenames in use to check the file contents and add the
 *  related asset files to the list as well, so they do not get deleted
 */
 function _getListOfRelatedFilesInUse(filesInUse, dirPath)
 {
    let list = [];

    return filesInUse.forAllPromises((filename) =>
    {
        let assetTagssMatch;
        const filePath = path.resolve(dirPath, filename);

        if (fs.existsSync(filePath) === false)
            return;

        list.push(filePath);

        return fsp.readFile(filePath, "utf8")
        .then((fileContent) =>
        {
            assetTagssMatch = fileContent.match(/\#(spr|spr1|spr2|icon|flag|indepflag|sample|imagefile|winterimagefile)\s*"?.+"?/ig);

            if (Array.isArray(assetTagssMatch) === false)
                return;

            assetTagssMatch.forEach((assetTag) =>
            {
                const relPath = assetTag.replace(/^\#\w+\s*("?.+"?)$/i, "$1").replace(/"/ig, "");
                const absolutePath = path.resolve(dirPath, relPath);

                if (fs.existsSync(absolutePath) === true)
                {
                    log.general(log.getNormalLevel(), `Found related file in use at ${absolutePath}`);
                    list.push(absolutePath);
                }

                else log.general(log.getLeanLevel(), `Related file in use found at path ${absolutePath} does not exist?`);
            });
        });
    })
    .then(() => Promise.resolve(list));
 }
 
 function _deleteUnusedFiles(filePaths, filesInUse, force)
 {
     let deletedFiles = [];
     log.general(log.getLeanLevel(), "Total related files to check for cleaning", filePaths.length);
 
     if (filePaths.length <= 0)
         return Promise.resolve(deletedFiles);
 
     return filePaths.forAllPromises((filePath) =>
     {
         if (filesInUse.includes(filePath) === false)
         {
             return Promise.resolve()
             .then(() =>
             {
                 if (force === true)
                     return fsp.unlink(filePath);
 
                 else return Promise.resolve();
             })
             .then(() => deletedFiles.push(filePath))
             .catch((err) => log.general(log.getLeanLevel(), `Failed to delete file ${filePath}`, err));
         }
     })
     .then(() => Promise.resolve(deletedFiles));
 }