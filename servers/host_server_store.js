
const path = require("path");
const fsp = require("fs").promises;
const log = require("../logger.js");
const asserter = require("../asserter.js");
const config = require("../config/config.json");
const HostServer = require("./prototypes/host_server.js");
const { isInstanceOfPrototypeOrThrow } = require("../asserter.js");
const parseProvinceCount = require("../games/parse_province_count.js");
const trustedServerData = require("../config/trusted_server_data.json");
const { getDominionsMapsPath, getDominionsModsPath, getDominionsMapExtension } = require("../helper_functions.js");


const _hostServersById = {};


//Populate the store with the basic known data of our servers
exports.populate = () => _populateStore();

exports.addHostServer = (...args) => _addHostServer(...args);
exports.removeHostServerById = (...args) => _removeHostServerById(...args);
exports.removeHostServerByName = (...args) => _removeHostServerByName(...args);
exports.isThereHostingSpaceAvailable = (...args) => _isThereHostingSpaceAvailable(...args);
exports.hasServersOnline = () => 
{
    let nbr = 0;

    for (let id in _hostServersById)
    {
        let server = _hostServersById[id];

        if (server.isOnline() === true)
            nbr++;
    }
    
    return nbr > 0;
};

exports.getHostServerById = (...args) => _findServerById(...args);
exports.hasHostServerById = (...args) => _findServerById(...args) != null;
exports.getHostServerBySocketId = (...args) => _findServerBySocketId(...args);

exports.getHostServerByName = (...args) => _findServerByName(...args);
exports.hasHostServerByName = (...args) => _findServerByName(...args) != null;

exports.getOnlineServers = () =>
{
    let servers = [];

    for (let id in _hostServersById)
    {
        let hostServerObject = _hostServersById[id];

        if (hostServerObject.isOnline() === true)
            servers.push(hostServerObject);
    }

    return servers;
};

exports.getOnlineServerWithMostSlots = () =>
{
    const onlineServers = module.exports.getOnlineServers();
    const sortedBySlots = onlineServers.sort((a, b) => b.getAvailableSlots() - a.getAvailableSlots());
    return (sortedBySlots.length > 0) ? sortedBySlots[0] : null;
};

exports.forEachServer = (fnToCall) =>
{
    for (let id in _hostServersById)
        fnToCall(_hostServersById[id]);
};

exports.getAvailableServersClientData = () =>
{
    let servers = [];

    for (let id in _hostServersById)
    {
        let hostServerObject = _hostServersById[id];

        if (hostServerObject.isOnline() === true && hostServerObject.hasAvailableSlots() === true)
        {
            servers.push(hostServerObject.getClientData());
        }
    }

    return servers;
};

exports.printListOfOnlineHostServers = () =>
{
    let str = "";

    for (let id in _hostServersById)
    {
        let hostServerObject = _hostServersById[id];
        
        if (hostServerObject.isOnline() === false)
            continue;
            
        str += `- ${hostServerObject.getName()}\n`;
    }

    return str;
};

exports.printListOfFreeSlots = () =>
{
    let stringList = "";

    for (let id in _hostServersById)
    {
        let hostServerObject = _hostServersById[id];
        
        if (hostServerObject.isOnline() === false)
            continue;

        stringList += `${hostServerObject.getName()}: ${hostServerObject.getAvailableSlots()}\n`;
    }

    return stringList;
};

module.exports.getMods = async function(gameType)
{
    let mods = [];

    if (asserter.isDom5GameType(gameType) === true) {
        mods = await _getDom5Modfiles();
    }
    else if (asserter.isDom6GameType(gameType) === true) {
        mods = await _getDom6Modfiles();
    }

    return mods;
};

async function _getDom5Modfiles()
{
    const gameType = config.dom5GameTypeName;
    const modsDirPath = path.resolve(getDominionsModsPath(gameType));
    const filenames = await fsp.readdir(modsDirPath);
    const modFilenames = filenames.filter((filename) => path.extname(filename) === ".dm");
    const modFilepaths = modFilenames.map((filename) => path.resolve(modsDirPath, filename));
    return modFilepaths.map((modpath) => {
        return { name: path.basename(modpath), path: modpath, relativePath: path.basename(modpath) };
    });
}

async function _getDom6Modfiles()
{
    const gameType = config.dom6GameTypeName;
    const modsDirPath = path.resolve(getDominionsModsPath(gameType));
    const subPaths = await fsp.readdir(modsDirPath, { withFileTypes: true });
    const modFolders = subPaths.filter((dirent) => dirent.isFile() === false);
    const modFilepaths = [];

    for (const modFolder of modFolders)
    {
        const modFolderPath = path.resolve(modFolder.path ?? modFolder.parentPath, modFolder.name);
        const filenames = await fsp.readdir(modFolderPath);
        const modFilename = filenames.find((f) => path.extname(f) === ".dm");

        if (modFilename != null) {
            const modpath = path.resolve(modFolderPath, modFilename);

            // The folder right above the mod's .dm file, which should be a wrapping subdir below "mods"
            const modWrappingFolder = path.basename(path.dirname(modpath));

            // relativePath is the last two elements in the path chain - the folder containing the mod, and its filename
            modFilepaths.push({ name: modFilename, path: modpath, relativePath: path.join(modWrappingFolder, modFilename) });
        }
    }

    return modFilepaths;
}

exports.getMapsWithProvCount = async (gameType) =>
{
    const mapsWithProvinceCount = [];
    let mapFilepaths;

    if (asserter.isDom5GameType(gameType) === true) {
        mapFilepaths = await exports.getDom5Mapfiles();
    }
    else if (asserter.isDom6GameType(gameType) === true) {
        mapFilepaths = await exports.getDom6Mapfiles();
    }

    for (const mapFile of mapFilepaths) {
        const content = await fsp.readFile(mapFile.path, "utf-8");
        const provs = parseProvinceCount(content, mapFile.name);

        if (provs != null)
            mapsWithProvinceCount.push(Object.assign(mapFile, provs));
    }

    // Sort map objects alphabetically by the filename
    mapsWithProvinceCount.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    return mapsWithProvinceCount;
};

exports.getDom5Mapfiles = async() =>
{
    const gameType = config.dom5GameTypeName;
    const mapsDirPath = path.resolve(getDominionsMapsPath(gameType));
    const filenames = await fsp.readdir(mapsDirPath);
    const mapFilenames = filenames.filter((filename) => path.extname(filename) === getDominionsMapExtension(gameType));
    const mapFilepaths = mapFilenames.map((filename) => {
        return { name: filename, relativePath: filename, path: path.resolve(mapsDirPath, filename) };
    });
    return mapFilepaths;
};

exports.getDom6Mapfiles = async () =>
{
    const gameType = config.dom6GameTypeName;
    const mapsDirPath = path.resolve(getDominionsMapsPath(gameType));
    const subPaths = await fsp.readdir(mapsDirPath, { withFileTypes: true });
    const mapFolders = subPaths.filter((dirent) => dirent.isFile() === false);
    const mapFilepaths = [];

    for (const mapFolder of mapFolders)
    {
        const mapFolderPath = path.resolve(mapFolder.path, mapFolder.name);
        const filenames = await fsp.readdir(mapFolderPath);
        const mapFilenames = filenames.filter((f) => path.extname(f) === getDominionsMapExtension(gameType));

        for (const mapFilename of mapFilenames)
        {
            if (mapFilename == null) 
            continue;

            // This is a planeX mapfile, which Dominions 6 automatically loads as a plane for a base map.
            // These should not really be useable on their own, so ignore them.
            if (new RegExp(`plane\\d+${getDominionsMapExtension(gameType)}$`).test(mapFilename) === true)
                continue;

            if (mapFilename != null) {
                const mappath = path.resolve(mapFolderPath, mapFilename);

                // The folder right above the map's .map file, which should be a wrapping subdir below "maps"
                const mapWrappingFolder = path.basename(path.dirname(mappath));

                // relativePath is the last two elements in the path chain - the folder containing the map, and its filename
                mapFilepaths.push({ name: mapFilename, path: mappath, relativePath: path.join(mapWrappingFolder, mapFilename) });
            }
        }
    }

    return mapFilepaths;
};

function _populateStore()
{
    log.general(log.getNormalLevel(), "Populating host server store...");

    for (let serverId in trustedServerData)
    {
        let hostServer = new HostServer(serverId);
        _addHostServer(hostServer);
    }
}

function _addHostServer(hostServerObject)
{
    isInstanceOfPrototypeOrThrow(hostServerObject, HostServer);
    _hostServersById[hostServerObject.getId()] = hostServerObject;
    log.general(log.getNormalLevel(), `Server ${hostServerObject.getName()} added to the store.`);
}

function _removeHostServerById(idToFind) 
{
    let server = _findServerById(idToFind);

    if (server != null)
        delete _hostServersById[idToFind];
}

function _removeHostServerByName(nameToFind) 
{
    let server = _findServerByName(nameToFind);

    if (server != null)
        delete _hostServersById[server.getId()];
}

function _isThereHostingSpaceAvailable()
{
    let hostingSpaceAvailable = 0;

    for (let id in _hostServersById)
    {
        let server = _hostServersById[id];

        if (server.isOnline() === false)
            continue;

        hostingSpaceAvailable += server.getAvailableSlots();
    }

    return hostingSpaceAvailable > 0;
}

function _findServerById(idToFind)
{
    if (idToFind == null)
        return null;

    for (let id in _hostServersById)
    {
        if (id.toLowerCase() === idToFind.toLowerCase())
            return _hostServersById[id];
    }
}

function _findServerBySocketId(idToFind)
{
    if (idToFind == null)
        return null;

    for (let id in _hostServersById)
    {
        const server = _hostServersById[id];

        if (server.getSocketId() === idToFind.toLowerCase())
            return server;
    }
}

function _findServerByName(nameToFind)
{
    if (nameToFind == null)
        return null;

    for (let id in _hostServersById)
    {
        let server = _hostServersById[id];

        if (server.getName().toLowerCase() === nameToFind.toLowerCase())
            return server;
    }
}