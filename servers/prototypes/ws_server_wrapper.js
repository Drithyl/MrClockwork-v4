

const log = require("../../logger.js");
const { WebSocketServer } = require("ws");
const assert = require("../../asserter.js");
const WebSocketWrapper = require("./ws_wrapper.js");
const hostServerStore = require("../host_server_store.js");

module.exports = WebSocketServerWrapper;


function WebSocketServerWrapper(port)
{
    const _port = port ?? 8080;
    const _wss = new WebSocketServer({ port: _port });
    const interval = setInterval(_ping.bind(null, _wss), 30000);

    var _onListeningHandler;
    var _onServerClosedHandler;
    var _onSocketConnectionHandler;
    var _onServerErrorHandler;

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

    _wss.on("listening", (err) =>
    {
        if (assert.isFunction(_onListeningHandler) === true)
            _onListeningHandler();
    });

    _wss.on("close", () =>
    {
        if (assert.isFunction(_onServerClosedHandler) === true)
            _onServerClosedHandler();
            
        clearInterval(interval);
    });

    _wss.on("connection", (ws, req) =>
    {
        if (assert.isFunction(_onSocketConnectionHandler) === true)
            _onSocketConnectionHandler(ws, req);

        ws.isAlive = true;
        ws.ip = req.socket.remoteAddress;
        ws.on("pong", _heartbeat);
    });

    _wss.on("error", (err) =>
    {
        if (assert.isFunction(_onServerErrorHandler) === true)
            _onServerErrorHandler(err);
    });
}

// Following recommended implentation:
// https://github.com/websockets/ws#how-to-detect-and-close-broken-connections
function _ping(server)
{
    server.clients.forEach((ws) =>
    {
        if (ws.isAlive === false)
        {
            log.error(log.getLeanLevel(), `Connection with socket ${ws.ip} timed out, terminating it...`);
            return ws.terminate();
        }
    
        ws.isAlive = false;
        ws.ping();
        log.time(ws.ip, `${ws.ip} pong, time since ping`);
    });
}

function _heartbeat()
{
    // 'this' is passed by context to the function on the event listeners
    this.isAlive = true;
    _ensureIsOnline(this);
    log.timeEnd(this.ip);
}

function _ensureIsOnline(ws)
{
    const server = hostServerStore.getHostServerBySocketId(ws.ip);
    
    if (server != null)
        return server.setOnline(true);
}
