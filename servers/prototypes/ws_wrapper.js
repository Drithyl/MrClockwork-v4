


const log = require("../../logger.js");
const assert = require("../../asserter.js");
const handleDom5Data = require("../../games/dominions5_runtime_data_handler.js");
const { TimeoutError, SocketResponseError } = require("../../errors/custom_errors");

module.exports = WebSocketWrapper;

function WebSocketWrapper(ws, ip)
{
    const _ws = ws;
    const _sentMessages = [];
    const _eventHandlers = {};
    const _ip = ip;

    // Handle incoming messages on this socket distributing them
    // among listening handlers or treating them as responses
    // from previously sent messages by this socket
    _ws.on("message", (data) =>
    {
        const parsedData = _parse(data);
        const trigger = parsedData.trigger;
        const pendingPromise = _sentMessages.find((wsPromise) => trigger === wsPromise.getTrigger());
        const handler = _eventHandlers[trigger];

        // If we were pending a response, handle it directly in the WebSocketPromise object
        if (assert.isInstanceOfPrototype(pendingPromise, WebSocketPromise) === true)
            pendingPromise.handleResponse(parsedData);

        // Otherwise this is a direct message, so handle its data with the registered handler
        else if (assert.isFunction(handler) === true)
            handler(parsedData.data, parsedData.expectsResponse);

        else log.error(log.getLeanLevel(), `Received message with unregistered trigger ${trigger}`);
    });

    this.getId = () => _ip;

    this.close = (code, reason) => _ws.close(code, reason);
    
    this.terminate = () => _ws.terminate();

    this.onDisconnect = (fnToCall) => _ws.on("close", fnToCall);

    this.emit = (trigger, data, error = null, expectsResponse = false) => 
    {
        const wrappedData = {
            trigger,
            data: data,
            expectsResponse,
            error: (assert.isObject(error) === true) ? error.message : error
        };

        _ws.send( _stringify(wrappedData) );
    };

    this.emitPromise = (trigger, data, timeout = 60000) =>
    {
        return new Promise((resolve, reject) =>
        {
            const wsPromise = new WebSocketPromise(trigger, resolve, reject, timeout);
            this.emit(trigger, data, null, true);
            _sentMessages.push(wsPromise);

            // Cleanup the promise from the array of sent messages
            // once it resolves, rejects or timeouts
            wsPromise.onFinished(() => 
            {
                _sentMessages.find((promise, i) =>
                {
                    if (promise.getTrigger() === trigger)
                    {
                        _sentMessages.splice(i, 1);
                        return true;
                    }
                });
            });
        });
    };

    this.listenTo = (trigger, handler) =>
    {
        if (assert.isFunction(handler) === false)
            throw new Error(`Handler must be a function; received ${typeof handler} instead!`);

        _eventHandlers[trigger] = (data, expectsResponse) =>
        {
            // Process data with the given handler
            Promise.resolve(handler(data))
            .then((result) =>
            {
                // Response to the received message
                // with resulting data
                if (expectsResponse === true)
                    module.exports.emit(trigger, result);
            })
            // Respond with an error if an exception was caught
            .catch((err) => 
            {
                if (expectsResponse === true)
                    this.emit(trigger, null, err)
            });
        };
    };

    
    this.listenTo("STDIO_DATA", (data) => 
    {
        log.general(log.getVerboseLevel(), `${data.name}: ${data.type} data received`, data.data);
        handleDom5Data(data.name, data.data);
    });

    this.listenTo("GAME_ERROR", (data) => 
    {
        log.error(log.getLeanLevel(), `${data.name} REPORTED GAME ERROR`, data.error);
        handleDom5Data(data.name, data.error);
    });
}

function WebSocketPromise(trigger, resolveFn, rejectFn, timeout)
{
    const _trigger = trigger;
    const _resolveFn = resolveFn;
    const _rejectFn = rejectFn;
    const _timeout = timeout ?? 60000;

    var _receivedResponse = false;
    var _cleanupHandler;

    this.getTrigger = () => _trigger;

    this.onFinished = (cleanupFn) => _cleanupHandler = cleanupFn;

    this.handleResponse = (data) =>
    {
        if (_receivedResponse === true)
            return;

        if (data == null)
            _settle(_rejectFn.bind(this, new SocketResponseError(`No data packet for this response was received!`)));

        else if (data.error != null)
            _settle(_rejectFn.bind(this, new SocketResponseError(data.error)));

        else _settle(_resolveFn.bind(this, data.data));
    };

    // If a timeout was given, start it as the creation of this object
    if (assert.isInteger(_timeout) === true && _timeout > 0)
    {
        setTimeout(function handleTimeout()
        {
            if (_receivedResponse === true)
                return;

            _receivedResponse = true;
            _settle(_rejectFn.bind(this, new TimeoutError(`Request timed out.`)));

            if (assert.isFunction(_cleanupHandler) === true)
                _cleanupHandler();

        }, _timeout);
    }

    function _settle(handlerFn)
    {
        if (_receivedResponse === true)
            return;

        _receivedResponse = true;
        handlerFn();

        if (assert.isFunction(_cleanupHandler) === true)
            _cleanupHandler();
    }
}

function _parse(data)
{
    var parsedData;

    if (Buffer.isBuffer(data) === true)
        parsedData = _jsonParseWithBufferRevival(data.toString());

    if (assert.isString(data) === true)
        parsedData = _jsonParseWithBufferRevival(data);

    return parsedData;
}

// Parse JSON while also checking if there is any nested serialized
// Buffer value. These appear as objects with a .type === "Buffer" and
// .data property that contains the actual buffer. If found, return the
// .data property properly converted to a Buffer object
function _jsonParseWithBufferRevival(data)
{
    return JSON.parse(data, (key, value) =>
    {
        if (_isSerializedBuffer(value) === true)
            return Buffer.from(value.data);

        return value;
    });
}

// Checks if an object is in fact a serialized Buffer. These appear as 
// objects with a .type === "Buffer" and .data property that contains the actual buffer.
function _isSerializedBuffer(value)
{
  return value != null && 
    typeof value === "object" &&
    value.type === "Buffer" && 
    Array.isArray(value.data) === true;
}

// Stringify that prevents circular references taken from https://antony.fyi/pretty-printing-javascript-objects-as-json/
function _stringify(data, spacing = 0)
{
	var cache = [];

	// custom replacer function gets around the circular reference errors by discarding them
	var str = JSON.stringify(data, function(key, value)
	{
		if (typeof value === "object" && value != null)
		{
			// value already found before, discard it
			if (cache.indexOf(value) !== -1)
			    return;

			// not found before, store this value for reference
			cache.push(value);
		}

		return value;

	}, spacing);

	// enable garbage collection
	cache = null;
	return str;
}