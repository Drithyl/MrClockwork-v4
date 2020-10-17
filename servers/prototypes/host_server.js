
const assert = require("../../asserter.js");
const ongoingGamesStore = require("../../games/ongoing_games_store");
const trustedServerData = require("../../config/trusted_server_data.json");

module.exports = HostServer;

//There will only be a single HostServer object for each connected slave server
//Each game's individual features like the port they are hosted on are build into
//their connection object, which in turn contains a HostServer instance.
function HostServer(id)
{
    assert.isString(id);
    assert.isString(trustedServerData[id].name);
    assert.isString(trustedServerData[id].ip);

    const _id = id;
    const _data = trustedServerData[id];
    const _name = _data.name;
    const _ip = _data.ip;

    var _isOnline = false;
    var _capacity;
    var _socketWrapper;

    this.getName = () => _name;
    this.getId = () => _id;
    this.getIp = () => _ip;
    this.getTotalCapacity = () => (_capacity == null) ? 0 : _capacity;

    //Data used by client-side code when accessing hosting website
    this.getClientData = () =>
    {
        return {
            name: this.getName(),
            ip: this.getIp(),
            slots: this.getAvailableSlots()
        };
    };

    this.isOnline = () => _isOnline;
    
    this.setOnline = (socketWrapper, capacity) =>
    {
        _socketWrapper = socketWrapper;
        _capacity = capacity;
        _isOnline = true;
    };

    this.setOffline = () =>
    {
        _socketWrapper = null;
        _capacity = null;
        _isOnline = false;
    };

    this.onDisconnect = (fnToCall) => _socketWrapper.onDisconnect(fnToCall);

    this.emitPromise = (...args) => _socketWrapper.emitPromise(...args);
    this.listenTo = (...args) => _socketWrapper.listenTo(...args);

    this.getAvailableSlots = () => this.getTotalCapacity() - this.getNbrOfGames();
    this.hasAvailableSlots = () => this.getAvailableSlots() > 0;

    this.getNbrOfGames = () =>
    {
        return ongoingGamesStore.getNbrOfGamesOnServer(this);
    };

    this.sendGameData = () =>
    {
        var gameData = ongoingGamesStore.getGameDataForHostServer(this);
        return this.emitPromise("GAME_DATA", gameData);
    };

    this.reserveGameSlot = () =>
    {
        if (this.hasAvailableSlots() === false)
            return Promise.reject(new Error(`No slots available on this server.`));

        return this.reservePort();
    };

    this.reservePort = () =>
    {
        return this.emitPromise("RESERVE_PORT")
        .then((portReserved) => portReserved)
        .catch((err) => Promise.reject(new Error(`Could not reserve a port on this server.`)));
    };
}