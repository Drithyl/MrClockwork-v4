
const Server = require("socket.io");
const assert = require("../../asserter.js");

module.exports = SocketIoServerWrapper;

function SocketIoServerWrapper(port, pingTimeout, pingInterval)
{
    const _ioObject = new Server(port ?? 8080, { 
        pingTimeout: pingTimeout ?? 60000, 
        pingInterval: pingInterval ?? 65000 
    });

    var _onServerClosedHandler;
    var _onSocketConnectionHandler;
    var _onServerErrorHandler;

    this.getPort = () => _port;

    this.onListening = (handler) =>
    {
        if (assert.isFunction(handler) === false)
            throw new Error(`onListening() handler must be a function; received ${typeof handler} instead!`);

        handler();
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

    this.close = () =>
    {
        if (assert.isFunction(_onServerClosedHandler) === true)
            _ioObject.close(_onServerClosedHandler);
    };

    _ioObject.on("connection", (ioSocket) =>
    {
        if (assert.isFunction(_onSocketConnectionHandler) === true)
            _onSocketConnectionHandler(ioSocket);
    });

    _ioObject.engine.on("connectin_error", (err) =>
    {
        if (assert.isFunction(_onServerErrorHandler) === true)
            _onServerErrorHandler(err);
    });
}