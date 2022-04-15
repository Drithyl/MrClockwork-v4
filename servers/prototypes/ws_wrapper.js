
const log = require("../../logger.js");
const handleDom5Data = require("../../games/dominions5_runtime_data_handler.js");
const { TimeoutError, SocketResponseError } = require("../../errors/custom_errors");


module.exports = ServerSocketWrapper;

function ServerSocketWrapper(ws)
{
    const _self = this;
    const _ws = ws;
    const _awaitingResponse = [];
    const _handlers = [];

    var _id;
    var _isAlive = true;
    var _onCloseHandlers = [];
    var _onErrorHandlers = [];

    _initialize();

    
    _self.isConnecting = () => _ws != null && _ws.readyState === _ws.CONNECTING;
    _self.isConnected = () => _ws != null && _ws.readyState === _ws.OPEN;
    _self.isClosing = () => _ws != null && _ws.readyState === _ws.CLOSING;
    _self.isClosed = () => _ws != null && _ws.readyState === _ws.CLOSED;
    
    _self.getId = () => _id;
    _self.setId = (id) => _id = id;
    
    _self.ping = () => _ws.ping();

    _self.isAlive = () => _isAlive;
    _self.setIsAlive = (isAlive) => _isAlive = isAlive;

    _self.close = () => _ws?.close();
    _self.terminate = () => _ws?.terminate();

    _self.emit = (trigger, data, error = null, expectsResponse = false) =>
    {
        const wrappedData = {
            trigger: trigger,
            data: data,
            error: (typeof error === "object" && error != null) ? error.message : error,
            expectsResponse: expectsResponse
        };
    
        _ws.send( _stringify(wrappedData) );
    };

    _self.emitPromise = (trigger, data, timeout = 60000) =>
    {
        return new Promise((resolve, reject) =>
        {
            try
            {
                _self.emit(trigger, data, null, true);
                _awaitingResponse.push({
                    trigger,
                    resolve,
                    reject
                });
        
                setTimeout(() =>
                {
                    const index = _awaitingResponse.findIndex((p) => p.trigger === trigger);

                    // Promise already got deleted beforehand
                    if (index === -1)
                        return;
        
                    _awaitingResponse[index].reject(new TimeoutError(`Request ${trigger} to socket ${_id} timed out`));
                    _awaitingResponse.splice(index, 1);
        
                }, timeout);
            }

            catch(err)
            {
                reject(err);
            }
        });
    };

    _self.onMessage = (trigger, handler, respond = false) =>
    {
        if (typeof handler !== "function")
            throw new TypeError(`Expected handler to be a function; received ${typeof handler}`);
    
        _handlers[trigger] = _wrapHandler(handler, trigger, respond);
    };

    _self.onMessage("STDIO_DATA", (data) => 
    {
        console.log(`${data.name}: ${data.type} data received`, data.data);
        //log.general(log.getVerboseLevel(), `${data.name}: ${data.type} data received`, data.data);
        //handleDom5Data(data.name, data.data);
    });

    _self.onMessage("GAME_ERROR", (data) => 
    {
        console.log(`${data.name} REPORTED GAME ERROR`, data.error);
        //log.error(log.getLeanLevel(), `${data.name} REPORTED GAME ERROR`, data.error);
        //handleDom5Data(data.name, data.error);
    });


    _self.onClose = (handler) => {
        (typeof handler === "function")
            _onCloseHandlers.push(handler);
    };

    _self.onError = (handler) => {
        (typeof handler === "function")
            _onErrorHandlers.push(handler);
    };


    function _initialize()
    {
        _ws.on("message", (data) => {
            _onMessageHandler(data);
        });

        _ws.on("close", (code, reason) => {
            _onCloseHandlers.forEach((handler) => handler(code, reason, _self));
        });

        _ws.on("error", (err) => {
            _onErrorHandlers.forEach((handler) => handler(err, _self));
        });

        // Add pong listener to catch client's socket response to ping
        // This means connection is alive if done within heartbeat interval
        _ws.on("pong", () => {
            _heartbeat();
        });
    }

    function _onMessageHandler(message)
    {
        const { trigger, data, error, expectsResponse } = _parse(message);
        const promiseIndex = _awaitingResponse.findIndex((p) => p.trigger === trigger);
        const pendingPromise = _awaitingResponse[promiseIndex];
        const handler = _handlers[trigger];
    
        if (promiseIndex === -1 && handler != null)
            handler(data, expectsResponse);
    
        if (promiseIndex > -1)
        {
            if (error != null)
                pendingPromise.reject(new SocketResponseError(error));
        
            else pendingPromise.resolve(data);

            // Remove promise after resolving/rejecting it
            _awaitingResponse.splice(promiseIndex, 1);
        }
    }

    // Private heartbeat function to check for broken connection
    function _heartbeat()
    {
        _self.setIsAlive(true);
    }
}


function _wrapHandler(handler, trigger)
{
    return async (data, expectsResponse) =>
    {
        try
        {
            const returnValue = await handler(data);

            if (expectsResponse === true)
                module.exports.emit(trigger, returnValue);
        }
     
        catch(err)
        {
            if (expectsResponse === true)
                module.exports.emit(trigger, null, err);
        }
    }
}


function _parse(data)
{
    var formattedData = {};
    var parsedData;

    if (Buffer.isBuffer(data) === true)
        parsedData = _jsonParseWithBufferRevival(data.toString());

    if (typeof data === "string")
        parsedData = _jsonParseWithBufferRevival(data);

    formattedData.trigger = parsedData.trigger;
    formattedData.data = parsedData.data;
    formattedData.error = parsedData.error;
    formattedData.expectsResponse = parsedData.expectsResponse;

    return formattedData;
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
