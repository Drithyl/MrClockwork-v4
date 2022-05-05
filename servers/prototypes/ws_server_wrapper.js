
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const assert = require("../../asserter.js");
const ServerSocketWrapper = require('./ws_wrapper');
const trustedServers = require("../../config/trusted_server_data.json");

const PING_INTERVAL = 3000;


module.exports = WebSocketServerWrapper;

function WebSocketServerWrapper(port)
{
    const _port = port ?? 8080;
    const _connectedSockets = [];
    const _server = createServer();
    const _wss = new WebSocketServer({ noServer: true });
    const _pingIntervalId = setInterval(_pingClients.bind(null, _connectedSockets), 30000);

    var _onListeningHandler;
    var _onServerClosedHandler;
    var _onSocketConnectionHandler;
    var _onServerErrorHandler;


    // First comes an upgrade request to the HTTP server to move to WebSockets
    _server.on('upgrade', function upgrade(request, socket, head) 
    {
        const passedAuthentication = _authenticate(request);

        if (passedAuthentication !== true)
        {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }

        // When authenticated properly, we accept the upgrade telling the
        // WSS to handle it. When done, we emit the connection event.
        _wss.handleUpgrade(request, socket, head, function done(ws) 
        {
            _wss.emit('connection', ws, request);
        });
    });

    // Now socket is connected to WebSocket!
    _wss.on('connection', function connection(ws, request) 
    {
        const wsWrapper = new ServerSocketWrapper(ws);
        wsWrapper.setId(request.socket.remoteAddress);
        
        _connectedSockets.push(wsWrapper);
        _ensureConnectionsMatch(_wss, _connectedSockets);
        _onSocketConnectionHandler(wsWrapper, request);
        
        // Set ws connection alive
        wsWrapper.setIsAlive(true);
    
        wsWrapper.onMessage("authentication", (id) =>
        {
            wsWrapper.setId(id);
        });
    
        // On client closed, run _close()
        wsWrapper.onClose(function onSocketClose(code, reason) {
            _onSocketClose(code, reason, wsWrapper);
        });
    
        wsWrapper.onError(function onSocketError(err) {
            _onSocketError(err, wss);
        });
    });
    
    _wss.on("listening", (err) =>
    {
        if (assert.isFunction(_onListeningHandler) === true)
            _onListeningHandler();
    });

    _wss.on("close", () =>
    {
        if (assert.isFunction(_onServerClosedHandler) === true)
            _onServerClosedHandler();
            
        clearInterval(_pingIntervalId);
    });

    _wss.on("error", (err) =>
    {
        if (assert.isFunction(_onServerErrorHandler) === true)
            _onServerErrorHandler(err);
    });

    _server.listen(_port);

    this.getPort = () => _port;

    this.onListening = (handler) =>
    {
        if (assert.isFunction(handler) === false)
            throw new Error(`onListening() handler must be a function; received ${typeof handler} instead!`);

        _onListeningHandler = handler;
    };

    this.onServerClosed = (handler) =>
    {
        if (assert.isFunction(handler) === false)
            throw new Error(`onServerClosed() handler must be a function; received ${typeof handler} instead!`);

        _onServerClosedHandler = handler;
    };

    this.onSocketConnection = (handler) =>
    {
        if (assert.isFunction(handler) === false)
            throw new Error(`onSocketConnection() handler must be a function; received ${typeof handler} instead!`);

        _onSocketConnectionHandler = handler;
    };

    this.onServerError = (handler) =>
    {
        if (assert.isFunction(handler) === false)
            throw new Error(`onServerError() handler must be a function; received ${typeof handler} instead!`);

        _onServerErrorHandler = handler;
    };


    function _onSocketClose(code, reason, wsWrapper)
    {
        const index = _connectedSockets.map((ws) => {
            return ws.getId();

        }).indexOf(wsWrapper.getId());

        _connectedSockets.splice(index, 1);
        _ensureConnectionsMatch(_wss, _connectedSockets);
    }
}


function _authenticate(req)
{
    const connectingIp = req.socket.remoteAddress;

    for (var id in trustedServers)
    {
        const serverData = trustedServers[id];
        const isAuthorizedIp = connectingIp.includes(serverData.ip);

        if (isAuthorizedIp === true)
            return true;
    }

    return false;
}

function _pingClients(clients)
{
    clients.forEach((wsWrapper) =>
    {
        // If on a new ping, ws is still not alive from _heartbeat(),
        // connection is likely broken, so terminate it
        if (wsWrapper.isAlive() === false)
            return _softSocketShutdown(wsWrapper);

        // Otherwise set it to false and ping again to await pong
        wsWrapper.setIsAlive(false);
        const promise = wsWrapper.ping(PING_INTERVAL);
    });
}

function _ensureConnectionsMatch(wss, connectedSockets)
{
    if (wss.clients.size !== connectedSockets.length)
        throw new Error(`WebSocketServer's size (${wss.clients.size}) does not match connectedSockets' length (${connectedSockets.length})`);
}

function _softSocketShutdown(wsWrapper)
{
    // First attempt, soft close. This sends a message to socket
    // to close gently, and waits for the response.
    wsWrapper.close();
    
    // Wait for a number of seconds on the socket response
    setTimeout(() => {

        // Second attempt, hard close if ws is still alive.
        // If the socket's current state is either the
        // OPEN or CLOSING constant values, terminate it
        if (wsWrapper.isConnected() === true || wsWrapper.isClosing() === true)
            wsWrapper.terminate();

    }, 10000);
}
