
const _express = require("express");
const log = require("../logger.js");
const config = require("../config/config.json");

const _expressApp = _express();
var _expressAppHttps;

const _expressHttpServer = require('http').Server(_expressApp);
var _expressHttpsServer;

// Raise pingTimeout and pingInterval since slaves have a lot of overhead on their first connection
// and won't make the default timeout of 20 seconds, thus creating constant connections and disconnections
const _ioObject = require('socket.io')(_expressHttpServer, { pingTimeout: 60000, pingInterval: 65000 });
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
        log.general(log.getNormalLevel(), `Express HTTP server running on port ${_expressHttpServer.address().port}`);
    });

    _ioObject.on("connection", (socket) => 
    {
        const wrapper = new SocketWrapper(socket);
        _requestServerData(wrapper);
    });

    _ioObject.engine.on("connection_error", (err) => 
    {
        log.general(log.getLeanLevel(), `Connection error occurred`, err);
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
        log.general(log.getNormalLevel(), `Express HTTP server running on port ${_expressHttpsServer.address().port}`);
    });
};


function _initializeHttpsServer()
{
    const fs = require("fs");
    const https = require("https");

    if (fs.existsSync(config.httpsCertificatePath) === false)
        return log.general(log.getNormalLevel(), "HTTPS certificate not found; skipping HTTPS server initialization.");
        
    if (fs.existsSync(config.httpsPrivateKeyPath) === false)
        return log.general(log.getNormalLevel(), "HTTPS private key not found; skipping HTTPS server initialization.");

    
    _expressAppHttps = _express();

    // Read HTTPS file contents
    const privateKey = fs.readFileSync(config.httpsPrivateKeyPath);
    const certificate = fs.readFileSync(config.httpsCertificatePath);
    
    // Create HTTPS server
    _expressHttpsServer = https.createServer({
        key: privateKey,
        cert: certificate
    }, _expressAppHttps);

    log.general(log.getNormalLevel(), "HTTPS server initialized.");
}

function _requestServerData(socketWrapper)
{
    log.general(log.getNormalLevel(), `Connection attempt by socket ${socketWrapper.getId()}`);

    socketWrapper.emitPromise("REQUEST_SERVER_DATA")
    .then((requestedData) =>
    {
        var hostServer;

        log.general(log.getVerboseLevel(), `Socket responded.`);

        if (requestedData == null)
            return log.general(log.getNormalLevel(), "Socket sent no data; ignoring.");

        else log.general(log.getNormalLevel(), "Data sent by socket: ", requestedData);

        if (_hostServerStore.hasHostServerById(requestedData.id) === false)
        {
            log.general(log.getNormalLevel(), `Unrecognized server id ${requestedData.id}; closing socket.`);
            return socketWrapper.close();
        }

        log.general(log.getNormalLevel(), `Received recognized server's data. Instantiating HostServer object.`);
        hostServer = _hostServerStore.getHostServerById(requestedData.id);
        
        hostServer.setOnline(socketWrapper, requestedData.capacity);
        
        hostServer.onDisconnect((reason) =>
        {
            hostServer.setOffline();
            log.general(log.getLeanLevel(), `Server ${hostServer.getName()} disconnected (reason: ${reason})`);
        });
        
        log.general(log.getNormalLevel(), "Sending game data...");

        return hostServer.sendGameData()
        .then(() => log.general(log.getNormalLevel(), "Server acknowledged game data. Launching games..."))
        .then(() => hostServer.launchGames())
        .then(() => log.general(log.getNormalLevel(), "Launch requests sent."));
    })
    .catch((err) => log.error(log.getNormalLevel(), `ERROR WITH SOCKET REQUEST_DATA`, err));
}