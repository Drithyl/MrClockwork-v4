"use strict";
var _express = require("express");
var _expressApp = _express();
var _expressServer = require('http').Server(_expressApp);
var _ioObject = require('socket.io')(_expressServer);
var _router = require("./web_router.js");
var _hostServerStore = require("./host_server_store.js");
exports.startListeningOnPort = function (port) {
    _router.setMiddlewares(_expressApp, _express);
    _router.setRoutes(_expressApp);
    _expressServer.listen(port, function () {
        console.log("Express HTTP server running on port " + _expressServer.address().port);
    });
    _ioObject.on("connection", _requestServerData);
};
function _requestServerData(socket) {
    console.log("Connection attempt by socket " + socket.id);
    socket.emit("REQUEST_SERVER_DATA", null, function (requestedData) {
        var hostServer;
        var serverId = requestedData.id;
        var serverCapacity = requestedData.capacity;
        if (_hostServerStore.hasHostServerById(serverId) === false) {
            console.log("Unrecognized server id " + serverId);
            return;
        }
        console.log("Received recognized server's data. Instantiating HostServer object.");
        hostServer = _hostServerStore.getHostServerById(serverId);
        hostServer.setOnline(socket, serverCapacity);
        hostServer.onDisconnect(function () {
            hostServer.setOffline();
            console.log("Server " + hostServer.getName() + " disconnected.");
        });
        console.log("Sending game data...");
        hostServer.sendGameData()
            .then(function () { return console.log("Server acknowledged game data."); })
            .catch(function (errMessage) { return console.log("ERROR; server not added to list: " + errMessage); });
    });
}
//# sourceMappingURL=express_server.js.map