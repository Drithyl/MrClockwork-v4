
const _express = require("express");
const config = require("../config/config.json");

const _expressApp = _express();
var _expressAppHttps;

const _expressHttpServer = require('http').Server(_expressApp);
var _expressHttpsServer;

const _ioObject = require('socket.io')(_expressHttpServer);
const _router = require("./web_router.js");
const _hostServerStore = require("./host_server_store.js");
const SocketWrapper = require("./prototypes/socket_wrapper.js");


_initializeHttpsServer();


exports.startListening = (port) => 
{
    _router.setMiddlewares(_expressApp, _express);
    _router.setRoutes(_expressApp);

    _expressHttpServer.listen(port, () => 
    {
        console.log(`Express HTTP server running on port ${_expressHttpServer.address().port}`);
    });

    _ioObject.on("connection", (socket) => 
    {
        const wrapper = new SocketWrapper(socket);
        _requestServerData(wrapper);
    });
};

exports.isHttpsAvailable = () =>
{
    if (_expressHttpsServer != null)
        return true;

    return false;
};

exports.startListeningSsl = (port) => 
{
    if (exports.isHttpsAvailable() === false)
        throw new Error(`HTTPS server not available. One of the certificate files was probably not found.`);

    _router.setMiddlewares(_expressAppHttps, _express);
    _router.setRoutes(_expressAppHttps);

    _expressHttpsServer.listen(port, () => 
    {
        console.log(`Express HTTP server running on port ${_expressHttpsServer.address().port}`);
    });

    _ioObject.on("connection", (socket) => 
    {
        const wrapper = new SocketWrapper(socket);
        _requestServerData(wrapper);
    });
};


function _initializeHttpsServer()
{
    const fs = require("fs");
    const https = require("https");

    if (fs.existsSync(config.httpsCertificatePath) === false)
        return console.log("HTTPS certificate not found; skipping HTTPS server initialization.");
        
    if (fs.existsSync(config.httpsPrivateKeyPath) === false)
        return console.log("HTTPS private key not found; skipping HTTPS server initialization.");

    
    _expressAppHttps = _express();

    // Read HTTPS file contents
    const privateKey = fs.readFileSync(config.httpsPrivateKeyPath);
    const certificate = fs.readFileSync(config.httpsCertificatePath);
    
    // Create HTTPS server
    _expressHttpsServer = https.createServer({
        key: privateKey,
        cert: certificate
    }, _expressAppHttps);

    console.log("HTTPS server initialized.");
}

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

        else console.log("Data sent by socket: ", requestedData);

        if (_hostServerStore.hasHostServerById(requestedData.id) === false)
        {
            console.log(`Unrecognized server id ${requestedData.id}; closing socket.`);
            return socketWrapper.close();
        }

        console.log(`Received recognized server's data. Instantiating HostServer object.`);
        hostServer = _hostServerStore.getHostServerById(requestedData.id);
        
        hostServer.setOnline(socketWrapper, requestedData.capacity);
        
        hostServer.onDisconnect(() =>
        {
            hostServer.setOffline();
            console.log(`Server ${hostServer.getName()} disconnected.`);
        });
        
        console.log("Sending game data...");

        return hostServer.sendGameData()
        .then(() => console.log("Server acknowledged game data. Launching games..."))
        .then(() => hostServer.launchGames())
        .then(() => console.log("Launch requests sent."));
    })
    .catch((errMessage) => console.log(`Error occurred; server not added to list: ${errMessage}`));
}