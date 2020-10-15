
const TimeoutError = require("../../errors/custom_errors").TimeoutError;
const SocketResponseError = require("../../errors/custom_errors").SocketResponseError;

module.exports = SocketWrapper;

function SocketWrapper(socketIoObject)
{
    const _socketIoObject = socketIoObject;

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
                    reject(new TimeoutError("No response from socket."));

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
}