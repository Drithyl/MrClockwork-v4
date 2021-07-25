
const log = require("./logger.js");
const config = require("./config/config.json");
const hostServerStore = require("./servers/host_server_store.js");
const ongoingGamesStore = require("./games/ongoing_games_store.js");

var modsAndMapsCleaningInterval;
const UTC_DAYS_TO_CLEAN = [3, 6];
const UTC_HOUR_TO_CLEAN = 22;
const ONE_HOUR = 3600000;
var isCleaningEnabled = config.isCleaningEnabled;


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
        exports.cleanUnusedMaps();
        exports.cleanUnusedMods();

    }, ONE_HOUR);
};

module.exports.cleanUnusedMaps = () =>
{
    const servers = hostServerStore.getOnlineServers();

    return servers.forAllPromises((server) =>
    {
        const mapsInUse = _getListOfMapsInUse(server);
        return _cleanUnusedFiles(mapsInUse, server, "DELETE_UNUSED_MAPS");
    })
    .then((results) => log.general(log.getLeanLevel(), `Map cleaning finished. Cleaned ${results.length} servers out of ${results.reduce((totalFiles, currentTotal, i, arr) => totalFiles + arr[i].length, 0)} files.`))
    .catch((err, resultsTillErr) => log.error(log.getLeanLevel(), `Map cleaning ERROR, cleaned ${resultsTillErr.length} servers out of ${resultsTillErr.reduce((totalFiles, currentTotal, i, arr) => totalFiles + arr[i].length, 0)} map files before error.`, err));
};

module.exports.cleanUnusedMods = () =>
{
    const servers = hostServerStore.getOnlineServers();

    return servers.forAllPromises((server) =>
    {
        const modsInUse = _getListOfModsInUse(server);
        return _cleanUnusedFiles(modsInUse, server, "DELETE_UNUSED_MODS");
    })
    .then((results) => log.general(log.getLeanLevel(), `Mod cleaning finished. Cleaned ${results.length} servers out of ${results.reduce((totalFiles, currentTotal, i, arr) => totalFiles + arr[i].length, 0)} files.`))
    .catch((err, resultsTillErr) => log.error(log.getLeanLevel(), `Mod cleaning ERROR, cleaned ${resultsTillErr.length} servers out of ${resultsTillErr.reduce((totalFiles, currentTotal, i, arr) => totalFiles + arr[i].length, 0)} mod files before error.`, err));
};


function _cleanUnusedFiles(filesInUse, server, serverMessage)
{
    log.general(log.getLeanLevel(), `${server.getName()} - ${serverMessage}: begin cleaning unused files...`);

    return server.emitPromise(serverMessage, filesInUse)
    .then((filesDeleted) => 
    {
        log.general(log.getLeanLevel(), `${server.getName()} - ${serverMessage}: cleaned unused files`, filesDeleted);
        return Promise.resolve(filesDeleted);
    })
    .catch((err) => 
    {
        log.error(log.getLeanLevel(), `${server.getName()} - ${serverMessage}: error occurred when cleaning files`, err);
        return Promise.reject(err);
    });
}

function _getListOfMapsInUse(targetServer)
{
    const usedMaps = [];
    const games = ongoingGamesStore.getArrayOfGames();

    games.forEach((game) =>
    {
        const settingsObject = game.getSettingsObject();
        const mapSetting = settingsObject.getMapSetting();

        if (game.getServerId() === targetServer.getId() === true)
            usedMaps.push(mapSetting.getValue());
    });

    return usedMaps;
}

function _getListOfModsInUse(targetServer)
{
    const usedMods = [];
    const games = ongoingGamesStore.getArrayOfGames();

    games.forEach((game) =>
    {
        const settingsObject = game.getSettingsObject();
        const modSetting = settingsObject.getModsSetting();

        if (game.getServerId() === targetServer.getId() === true)
        {
            const modsInUse = modSetting.getValue();

            if (Array.isArray(modsInUse) === true && modsInUse.length > 0)
                usedMods.push([...modSetting.getValue()]);
        }
    });

    return usedMods;
}