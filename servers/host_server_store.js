
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

module.exports.getDom5Mods = function()
{
    const mapsDirPath = path.resolve(config.pathToDom5Data, "mods");

	return rw.getDirFilenames(mapsDirPath, ".dm")
	.then((filenames) => Promise.resolve(filenames));
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

    return mapsWithProvinceCount;
};

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