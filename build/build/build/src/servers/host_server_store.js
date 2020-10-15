"use strict";
var _hostServersById = {};
var HostServer = require("./prototypes/host_server.js");
var isInstanceOfPrototypeOrThrow = require("../asserter.js").isInstanceOfPrototypeOrThrow;
var trustedServerData = require("../config/trusted_server_data.json");
//Populate the store with the basic known data of our servers
exports.populate = function () { return _populateStore(); };
exports.addHostServer = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _addHostServer.apply(void 0, args);
};
exports.removeHostServerById = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _removeHostServerById.apply(void 0, args);
};
exports.removeHostServerByName = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _removeHostServerByName.apply(void 0, args);
};
exports.isThereHostingSpaceAvailable = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _isThereHostingSpaceAvailable.apply(void 0, args);
};
exports.hasServersOnline = function () {
    var nbr = 0;
    for (var id in _hostServersById) {
        var server = _hostServersById[id];
        if (server.isOnline() === true)
            nbr++;
    }
    return nbr > 0;
};
exports.getHostServerById = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _findServerById.apply(void 0, args);
};
exports.hasHostServerById = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _findServerById.apply(void 0, args) != null;
};
exports.getHostServerByName = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _findServerByName.apply(void 0, args);
};
exports.hasHostServerByName = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return _findServerByName.apply(void 0, args) != null;
};
exports.getAvailableServers = function () {
    var servers = [];
    for (var id in _hostServersById) {
        var hostServerObject = _hostServersById[id];
        if (hostServerObject.isOnline() === true && hostServerObject.hasAvailableSlots() === true) {
            servers.push(hostServerObject.getClientData());
        }
    }
    return servers;
};
exports.getListOfOnlineHostServers = function () {
    var str = "";
    for (var id in _hostServersById) {
        var hostServerObject = _hostServersById[id];
        if (hostServerObject.isOnline() === false)
            continue;
        str += "- " + hostServerObject.getName() + "\n";
    }
    return str;
};
exports.printListOfFreeSlots = function () {
    var stringList = "";
    for (var id in _hostServersById) {
        var hostServerObject = _hostServersById[id];
        if (hostServerObject.isOnline() === false)
            continue;
        stringList += hostServerObject.getName() + ": " + hostServerObject.getAvailableSlots();
    }
    return stringList;
};
function _populateStore() {
    console.log("Populating host server store...");
    for (var serverId in trustedServerData) {
        var hostServer = new HostServer(serverId);
        _addHostServer(hostServer);
    }
}
function _addHostServer(hostServerObject) {
    isInstanceOfPrototypeOrThrow(hostServerObject, HostServer);
    _hostServersById[hostServerObject.getId()] = hostServerObject;
    console.log("Server " + hostServerObject.getName() + " added to the store.");
}
function _removeHostServerById(idToFind) {
    var server = _findServerById(idToFind);
    if (server != null)
        delete _hostServersById[idToFind];
}
function _removeHostServerByName(nameToFind) {
    var server = _findServerByName(nameToFind);
    if (server != null)
        delete _hostServersById[server.getId()];
}
function _isThereHostingSpaceAvailable() {
    var hostingSpaceAvailable = 0;
    for (var id in _hostServersById) {
        var server = _hostServersById[id];
        if (server.isOnline() === false)
            continue;
        hostingSpaceAvailable += server.getAvailableSlots();
    }
    return hostingSpaceAvailable > 0;
}
function _findServerById(idToFind) {
    if (idToFind == null)
        return null;
    for (var id in _hostServersById) {
        if (id.toLowerCase() === idToFind.toLowerCase())
            return _hostServersById[id];
    }
}
function _findServerByName(nameToFind) {
    if (nameToFind == null)
        return null;
    for (var id in _hostServersById) {
        var server = _hostServersById[id];
        if (server.getName().toLowerCase() === nameToFind.toLowerCase())
            return server;
    }
}
//# sourceMappingURL=host_server_store.js.map