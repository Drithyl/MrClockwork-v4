
const path = require("path");
const fsp = require("fs").promises;
const log = require("../logger.js");
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
    var nbr = 0;

    for (var id in _hostServersById)
    {
        var server = _hostServersById[id];

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
    var servers = [];

    for (var id in _hostServersById)
    {
        var hostServerObject = _hostServersById[id];

        if (hostServerObject.isOnline() === true)
            servers.push(hostServerObject);
    }

    return servers;
};

exports.forEachServer = (fnToCall) =>
{
    for (var id in _hostServersById)
        fnToCall(_hostServersById[id]);
};

exports.getAvailableServersClientData = () =>
{
    var servers = [];

    for (var id in _hostServersById)
    {
        var hostServerObject = _hostServersById[id];

        if (hostServerObject.isOnline() === true && hostServerObject.hasAvailableSlots() === true)
        {
            servers.push(hostServerObject.getClientData());
        }
    }

    return servers;
};

exports.printListOfOnlineHostServers = () =>
{
    var str = "";

    for (var id in _hostServersById)
    {
        var hostServerObject = _hostServersById[id];
        
        if (hostServerObject.isOnline() === false)
            continue;
            
        str += `- ${hostServerObject.getName()}\n`;
    }

    return str;
};

exports.printListOfFreeSlots = () =>
{
    var stringList = "";

    for (var id in _hostServersById)
    {
        var hostServerObject = _hostServersById[id];
        
        if (hostServerObject.isOnline() === false)
            continue;

        stringList += `${hostServerObject.getName()}: ${hostServerObject.getAvailableSlots()}\n`;
    }

    return stringList;
};

module.exports.getMods = async function(gameType)
{
    let mods = [];

    if (gameType === config.dom5GameTypeName) {
        mods = await _getDom5Modfiles();
    }
    else if (gameType === config.dom6GameTypeName) {
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
        return { name: path.basename(modpath), path: modpath };
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
            modFilepaths.push({ name: modFilename, path: modpath });
        }
    }

    return modFilepaths;
}

exports.getMaps = async (gameType) =>
{
    const mapsWithProvinceCount = [];
    let mapFilepaths;

    if (gameType === config.dom5GameTypeName) {
        mapFilepaths = await _getDom5Mapfiles();
    }
    else if (gameType === config.dom6GameTypeName) {
        mapFilepaths = await _getDom6Mapfiles();
    }

    await mapFilepaths.forAllPromises(async (filepath) =>
    {
        const filename = path.basename(filepath);
        const content = await fsp.readFile(filepath, "utf-8");
        const provs = parseProvinceCount(content, filename);

        if (provs != null)
            mapsWithProvinceCount.push({name: filename, ...provs});
    });

    // Sort map objects alphabetically by the filename
    mapsWithProvinceCount.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    return mapsWithProvinceCount;
};

async function _getDom5Mapfiles()
{
    const gameType = config.dom5GameTypeName;
    const mapsDirPath = path.resolve(getDominionsMapsPath(gameType));
    const filenames = await fsp.readdir(mapsDirPath);
    const mapFilenames = filenames.filter((filename) => path.extname(filename) === getDominionsMapExtension(gameType));
    const mapFilepaths = mapFilenames.map((filename) => path.resolve(mapsDirPath, filename));
    return mapFilepaths;
}

async function _getDom6Mapfiles()
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
        const mapFilename = filenames.find((f) => path.extname(f) === ".map" || path.extname(f) === ".d6m");

        if (mapFilename != null) {
            mapFilepaths.push(path.resolve(mapFolderPath, mapFilename));
        }
    }

    return mapFilepaths;
}

function _populateStore()
{
    log.general(log.getNormalLevel(), "Populating host server store...");

    for (var serverId in trustedServerData)
    {
        var hostServer = new HostServer(serverId);
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
    var server = _findServerById(idToFind);

    if (server != null)
        delete _hostServersById[idToFind];
}

function _removeHostServerByName(nameToFind) 
{
    var server = _findServerByName(nameToFind);

    if (server != null)
        delete _hostServersById[server.getId()];
}

function _isThereHostingSpaceAvailable()
{
    var hostingSpaceAvailable = 0;

    for (var id in _hostServersById)
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

    for (var id in _hostServersById)
    {
        if (id.toLowerCase() === idToFind.toLowerCase())
            return _hostServersById[id];
    }
}

function _findServerBySocketId(idToFind)
{
    if (idToFind == null)
        return null;

    for (var id in _hostServersById)
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

    for (var id in _hostServersById)
    {
        let server = _hostServersById[id];

        if (server.getName().toLowerCase() === nameToFind.toLowerCase())
            return server;
    }
}