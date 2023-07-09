
const path = require("path");
const fsp = require("fs").promises;
const log = require("../logger.js");
const rw = require("../reader_writer.js");
const config = require("../config/config.json");
const HostServer = require("./prototypes/host_server.js");
const { isInstanceOfPrototypeOrThrow } = require("../asserter.js");
const parseProvinceCount = require("../games/parse_povince_count.js");
const trustedServerData = require("../config/trusted_server_data.json");


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

module.exports.getDom5Mods = async function()
{
    const modsDirPath = path.resolve(config.pathToDom5Data, "mods");

	const filenames = await rw.getDirFilenames(modsDirPath, ".dm");
    filenames.sort();
    return filenames;
};

exports.getDom5Maps = async () =>
{
    const mapsDirPath = path.resolve(config.pathToDom5Data, "maps");
    const mapsWithProvinceCount = [];
    const filenames = await fsp.readdir(mapsDirPath);
    const mapFilenames = filenames.filter((filename) => path.extname(filename) === ".map");

    await mapFilenames.forAllPromises(async (filename) =>
    {
        const filePath = path.resolve(mapsDirPath, filename);
        const content = await fsp.readFile(filePath, "utf-8");
        const provs = parseProvinceCount(content);

        if (provs != null)
            mapsWithProvinceCount.push({name: filename, ...provs});
    });

    // Sort map objects alphabetically by the filename
    mapsWithProvinceCount.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    return mapsWithProvinceCount;
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