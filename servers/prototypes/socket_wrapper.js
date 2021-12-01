
const log = require("../../logger.js");
const rw = require("../../reader_writer.js");
const handleDom5Data = require("../../games/dominions5_runtime_data_handler.js");
const { TimeoutError, SocketResponseError } = require("../../errors/custom_errors");

module.exports = SocketWrapper;

function SocketWrapper(socketIoObject)
{
    const _socketIoObject = socketIoObject;

    this.getId = () => _socketIoObject.id;

    this.close = (shouldCloseConnection = false) => _socketIoObject.disconnect(shouldCloseConnection);

    this.onDisconnect = (fnToCall) => _socketIoObject.on("disconnect", (reason) => fnToCall(reason));

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
                    return reject(new SocketResponseError(`Request ${trigger} response error: ${errMessage}`));

                else return resolve(returnData);
            });

            setTimeout(function handleTimeout()
            {
                if (receivedResponse === false)
                {
                    log.general(log.getVerboseLevel(), `Request ${trigger} timed out without a response from server. Data sent was:\n\n${rw.JSONStringify(data)}`);
                    reject(new TimeoutError(`Request ${trigger} timed out without a response from server.`));
                }

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
                .then((handlerReturnValue) => 
                {
                    callback(handlerReturnValue);
                    resolve();
                })
                .catch((err) => reject(err));
            });
        });
    };

    
    this.listenTo("NEW_TURN", (data) => log.general(log.getNormalLevel(), `${data.name}: New turn!`));
    this.listenTo("STDIO_CLOSED", (data) => log.general(log.getNormalLevel(), `${data.name}: stdio closed with code ${data.code}`));
    this.listenTo("STDIO_DATA", (data) => 
    {
        log.general(log.getVerboseLevel(), `${data.name}: ${data.type} data received`, data.data);
        handleDom5Data(data.name, data.data);
    });

    this.listenTo("STDIO_ERROR", (data) => 
    {
        log.error(log.getLeanLevel(), `${data.name}: ${data.type} ERROR RECEIVED`, data.error);
        handleDom5Data(data.name, data.error);
    });

    this.listenTo("GAME_ERROR", (data) => 
    {
        log.error(log.getLeanLevel(), `${data.name} REPORTED GAME ERROR`, data.error);
        handleDom5Data(data.name, data.error);
    });
}