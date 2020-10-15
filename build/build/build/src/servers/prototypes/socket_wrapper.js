"use strict";
var TimeoutError = require("../../errors/custom_errors").TimeoutError;
var SocketResponseError = require("../../errors/custom_errors").SocketResponseError;
module.exports = SocketWrapper;
function SocketWrapper(socketIoObject) {
    var _this = this;
    var _socketIoObject = socketIoObject;
    this.onDisconnect = function (fnToCall) { return _socketIoObject.on("disconnect", function () { return fnToCall(_this); }); };
    this.emit = function (trigger, data) { return _socketIoObject.emit(trigger, data); };
    this.emitPromise = function (trigger, data) {
        return new Promise(function (resolve, reject) {
            var receivedResponse = false;
            _socketIoObject.emit(trigger, data, function handleResponse(errMessage, returnData) {
                receivedResponse = true;
                if (errMessage != null)
                    return reject(new SocketResponseError(errMessage));
                else
                    return resolve(returnData);
            });
            setTimeout(function handleTimeout() {
                if (receivedResponse === false)
                    reject(new TimeoutError("No response from socket."));
            }, 60000);
        });
    };
    this.listenTo = function (trigger, handler) {
        return new Promise(function (resolve, reject) {
            _socketIoObject.on(trigger, function (response, callback) {
                Promise.resolve(handler(response))
                    .then(function (handlerReturnValue) { return callback(handlerReturnValue); })
                    .then(function () { return resolve(); })
                    .catch(function (err) { return reject(err); });
            });
        });
    };
}
//# sourceMappingURL=socket_wrapper.js.map