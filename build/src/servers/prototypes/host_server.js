"use strict";
var assert = require("../../asserter.js");
var SocketWrapper = require("./socket_wrapper.js");
var ongoingGamesStore = require("../../games/ongoing_games_store");
var trustedServerData = require("../../config/trusted_server_data.json");
module.exports = HostServer;
//There will only be a single HostServer object for each connected slave server
//Each game's individual features like the port they are hosted on are build into
//their connection object, which in turn contains a HostServer instance.
function HostServer(id) {
    var _this = this;
    assert.isString(id);
    assert.isString(trustedServerData[id].name);
    assert.isString(trustedServerData[id].ip);
    var _id = id;
    var _data = trustedServerData[id];
    var _name = _data.name;
    var _ip = _data.ip;
    var _isOnline = false;
    var _capacity;
    var _socketWrapper;
    this.getName = function () { return _name; };
    this.getId = function () { return _id; };
    this.getIp = function () { return _ip; };
    this.getTotalCapacity = function () { return (_capacity == null) ? 0 : _capacity; };
    //Data used by client-side code when accessing hosting website
    this.getClientData = function () {
        return {
            name: _this.getName(),
            ip: _this.getIp(),
            slots: _this.getAvailableSlots()
        };
    };
    this.isOnline = function () { return _isOnline; };
    this.setOnline = function (ioSocket, capacity) {
        _socketWrapper = new SocketWrapper(ioSocket);
        _capacity = capacity;
        _isOnline = true;
    };
    this.setOffline = function () {
        _socketWrapper = null;
        _capacity = null;
        _isOnline = false;
    };
    this.onDisconnect = function (fnToCall) { return _socketWrapper.onDisconnect(fnToCall); };
    this.emitPromise = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _socketWrapper.emitPromise.apply(_socketWrapper, args);
    };
    this.listenTo = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _socketWrapper.listenTo.apply(_socketWrapper, args);
    };
    this.getAvailableSlots = function () { return _this.getTotalCapacity() - _this.getNbrOfGames(); };
    this.hasAvailableSlots = function () { return _this.getAvailableSlots() > 0; };
    this.getNbrOfGames = function () {
        return ongoingGamesStore.getNbrOfGamesOnServer(_this);
    };
    this.sendGameData = function () {
        var gameData = ongoingGamesStore.getGameDataForHostServer(_this);
        return _this.emitPromise("GAME_DATA", gameData);
    };
    this.reserveGameSlot = function () {
        if (_this.hasAvailableSlots() === false)
            return Promise.reject(new Error("No slots available on this server."));
        return _this.reservePort();
    };
    this.reservePort = function () {
        return _this.emitPromise("RESERVE_PORT")
            .then(function (portReserved) { return portReserved; })
            .catch(function (err) { return Promise.reject(new Error("Could not reserve a port on this server.")); });
    };
}
//# sourceMappingURL=host_server.js.map