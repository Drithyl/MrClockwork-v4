
const _express = require("express");
const log = require("../logger.js");
const assert = require("../asserter.js");
const config = require("../config/config.json");

const _expressApp = _express();
var _expressAppHttps;

const _expressHttpServer = require('http').Server(_expressApp);
var _expressHttpsServer;

// Wrappers for socket and socket server. We can use socket io wrapers or ws wrappers
const SocketServerWrapper = (config.useWs === true) ? 
    require('./prototypes/ws_server_wrapper.js') : 
    require("./prototypes/socket_io_server_wrapper.js");

const SocketWrapper = (config.useWs === true) ? 
    require('./prototypes/ws_wrapper.js') : 
    require("./prototypes/socket_io_wrapper.js");

// Raise pingTimeout and pingInterval since slaves have a lot of overhead on their first connection
// and won't make the default timeout of 20 seconds, thus creating constant connections and disconnections
var _socketServer;
const _router = require("./web_router.js");
const _hostServerStore = require("./host_server_store.js");


_initializeHttpsServer();


exports.startListening = (port) => 
{
    _socketServer = new SocketServerWrapper(config.socketPort, 60000, 65000);

    _socketServer.onListening(() => 
    {
        log.general(log.getLeanLevel(), `Socket server listening on port ${config.socketPort}`);
    });

    _socketServer.onSocketConnection((socket, req) => 
    {
        const wrapper = new SocketWrapper(socket, (req != null) ? req.socket.remoteAddress : undefined);
        log.general(log.getNormalLevel(), `Connection attempt by socket ${wrapper.getId()}`);
        _handleSocketConnection(wrapper);
    });

    _socketServer.onServerError((err) => 
    {
        log.general(log.getLeanLevel(), `Server connection error occurred`, err);
    });


    _router.setMiddlewares(_expressApp, _express);
    _router.setRoutes(_expressApp);

    _expressHttpServer.listen(port, () => 
    {
        log.general(log.getNormalLevel(), `Express HTTP server running on port ${_expressHttpServer.address().port}`);
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

async function _handleSocketConnection(socketWrapper)
{
    const serverData = await _requestAuthenticationData(socketWrapper) ?? {};
    const { id, capacity } = serverData;

    if (_isTrustedSlave(id, capacity) !== true)
    {
        log.general(log.getNormalLevel(), `Socket ${socketWrapper.getId()} failed to authenticate`);
        return socketWrapper.terminate();
    }

    _initializeHostServer(socketWrapper, id, capacity);
}

async function _requestAuthenticationData(socketWrapper)
{
    try
    {
        const serverData = await socketWrapper.emitPromise("REQUEST_SERVER_DATA") ?? {};
        return serverData;
    }

    catch(err)
    {
        if (err.name === "SocketTimeout")
            log.general(log.getNormalLevel(), `Request to socket ${socketWrapper.getId()} for authentication data timed out`, err.stack);

        return null;
    }
}

function _isTrustedSlave(slaveId, capacity)
{
    if (slaveId == null)
        return false;

    if (assert.isInteger(capacity) === false || capacity <= 0)
        return false;

    if (_hostServerStore.hasHostServerById(slaveId) === false)
        return false;
        
    return true;
}

async function _initializeHostServer(socketWrapper, id, capacity)
{
    log.general(log.getNormalLevel(), `Received recognized server's data. Instantiating HostServer object.`);
    hostServer = _hostServerStore.getHostServerById(id);
    
    hostServer.initializeConnection(socketWrapper, capacity);
    
    hostServer.onDisconnect((reason) =>
    {
        hostServer.terminateConnection();
        log.general(log.getLeanLevel(), `Server ${hostServer.getName()} disconnected (reason: ${reason})`);
    });
    
    log.general(log.getNormalLevel(), "Sending game data...");

    await hostServer.sendGameData();
    log.general(log.getNormalLevel(), "Server acknowledged game data. Launching games...");

    hostServer.launchGames();
    log.general(log.getNormalLevel(), "Launch requests sent.");
}