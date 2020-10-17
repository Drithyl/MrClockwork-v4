

const _express = require("express");
const _expressApp = _express();
const _expressServer = require('http').Server(_expressApp);
const _ioObject = require('socket.io')(_expressServer);
const _router = require("./web_router.js");
const _hostServerStore = require("./host_server_store.js");
const SocketWrapper = require("./prototypes/socket_wrapper.js");

exports.startListeningOnPort = (port) => 
{
    _router.setMiddlewares(_expressApp, _express);
    _router.setRoutes(_expressApp);

    _expressServer.listen(port, () => 
    {
        console.log(`Express HTTP server running on port ${_expressServer.address().port}`);
    });

    _ioObject.on("connection", (socket) => _requestServerData(new SocketWrapper(socket)));
};

function _requestServerData(socketWrapper)
{
    console.log(`Connection attempt by socket ${socketWrapper.getId()}`);

    socketWrapper.emitPromise("REQUEST_SERVER_DATA")
    .then((requestedData) =>
    {
        var hostServer;

        console.log(`Socket responded.`);

        if (requestedData == null)
            return console.log("Socket sent no data; ignoring.");

        if (_hostServerStore.hasHostServerById(requestedData.id) === false)
            return console.log(`Unrecognized server id ${requestedData.id}`);

        console.log(`Received recognized server's data. Instantiating HostServer object.`);
        hostServer = _hostServerStore.getHostServerById(requestedData.id);
        
        hostServer.setOnline(socketWrapper, requestedData.capacity);
        
        hostServer.onDisconnect(() =>
        {
            hostServer.setOffline();
            console.log(`Server ${hostServer.getName()} disconnected.`);
        });
        
        console.log("Sending game data...");
        return hostServer.sendGameData();
    })
    .then(() => console.log("Server acknowledged game data."))
    .catch((errMessage) => console.log(`Error occurred; server not added to list: ${errMessage}`));
}