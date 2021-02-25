
const TimeoutError = require("../../errors/custom_errors").TimeoutError;
const SocketResponseError = require("../../errors/custom_errors").SocketResponseError;
const handleDom5Error = require("../../games/dominions5_runtime_error_handler.js");

module.exports = SocketWrapper;

function SocketWrapper(socketIoObject)
{
    const _socketIoObject = socketIoObject;

    this.getId = () => _socketIoObject.id;

    this.close = (shouldCloseConnection = true) => _socketIoObject.disconnect(shouldCloseConnection);

    this.onDisconnect = (fnToCall) => _socketIoObject.on("disconnect", () => fnToCall(this));

    this.emit = (trigger, data) => _socketIoObject.emit(trigger, data);

    this.emitPromise = (trigger, data) =>
    {
        return new Promise((resolve, reject) =>
        {
            var receivedResponse = false;

            _socketIoObject.emit(trigger, data, function handleResponse(errMessage, returnData)
            {
                receivedResponse = true;

                if (errMessage != null)
                    return reject(new SocketResponseError(errMessage));

                else return resolve(returnData);
            });

            setTimeout(function handleTimeout()
            {
                if (receivedResponse === false)
                    reject(new TimeoutError(`Request ${trigger} received no response from socket. Data sent was:\n\n${data}`));

            }, 60000);
        });
    };

    this.listenTo = (trigger, handler) =>
    {
        return new Promise((resolve, reject) =>
        {
            _socketIoObject.on(trigger, function(response, callback)
            {
                Promise.resolve(handler(response))
                .then((handlerReturnValue) => callback(handlerReturnValue))
                .then(() => resolve())
                .catch((err) => reject(err));
            });
        });
    };

    
    this.listenTo("NEW_TURN", (data) => console.log(`${data.name}: New turn!`));
    this.listenTo("STDIO_CLOSED", (data) => console.log(`${data.name}: stdio closed with code ${data.code}`));
    this.listenTo("STDIO_DATA", (data) => console.log(`${data.name}: ${data.type} data received: ${data.data}`));

    this.listenTo("STDIO_ERROR", (data) => 
    {
        console.log(`${data.name}: ${data.type} ERROR received: ${data.error}`);
        handleDom5Error(data.name, data.error);
    });

    this.listenTo("GAME_ERROR", (data) => 
    {
        console.log(`${data.name}: reported game error: ${data.error}`);
        handleDom5Error(data.name, data.error);
    });
}