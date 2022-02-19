
const log = require("../../logger.js");
const assert = require("../../asserter.js");
const gameMonitor = require("../../games/game_monitor.js");
const { SocketResponseError } = require("../../errors/custom_errors.js");
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

        _socketWrapper.listenTo("GAME_UPDATE", (data) =>
        {
            const game = ongoingGamesStore.getOngoingGameByName(data.gameName);
            gameMonitor.updateDom5Game(game, data);
        });
    };

    this.setOffline = () =>
    {
        _capacity = null;
        _isOnline = false;
    };

    this.onDisconnect = (fnToCall) => 
    {
        if (_isOnline === false)
            throw new SocketResponseError(`Server is offline.`);

        return _socketWrapper.onDisconnect(fnToCall);
    };

    this.emitPromise = (...args) => 
    {
        if (_isOnline === false)
            return Promise.reject(new SocketResponseError(`Server is offline.`));

        return _socketWrapper.emitPromise(...args);
    };
    this.listenTo = (...args) => 
    {
        if (_isOnline === false)
            return Promise.reject(new SocketResponseError(`Server is offline.`));
            
        return _socketWrapper.listenTo(...args);
    };

    this.getAvailableSlots = () => this.getTotalCapacity() - this.getNbrOfGames();
    this.hasAvailableSlots = () => this.getAvailableSlots() > 0;

    this.getNbrOfGames = () =>
    {
        return ongoingGamesStore.getNbrOfGamesOnServer(this);
    };

    this.launchGames = () =>
    {
        ongoingGamesStore.getOngoingGamesOnServer(this).forEach((game) =>
        {
            game.launch()
            .then(() => log.general(log.getNormalLevel(), `${game.getName()} launched!`))
            .catch((err) => log.error(log.getLeanLevel(), `${game.getName()} LAUNCH ERROR`, err));
        });
    };

    this.sendGameData = () =>
    {
        const gameData = ongoingGamesStore.getGameDataForHostServer(this);
        return this.emitPromise("GAME_DATA", gameData)
        .catch((err) => Promise.reject(err));
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

    this.getDom5MapsOnServer = () =>
    {
        return this.emitPromise("GET_MAP_LIST", null, 300000)
        .then((mapList) => Promise.resolve(mapList))
        .catch((err) => Promise.reject(new Error(`Could not retrieve the list of maps: ${err.message}`)));
    };

    this.getDom5ModsOnServer = () =>
    {
        return this.emitPromise("GET_MOD_LIST", null, 300000)
        .then((mapList) => Promise.resolve(mapList))
        .catch((err) => Promise.reject(new Error(`Could not retrieve the list of mods: ${err.message}`)));
    };
}