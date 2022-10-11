
const log = require("../../logger.js");
const assert = require("../../asserter.js");
const gameMonitor = require("../../games/game_monitor.js");
const { SocketResponseError } = require("../../errors/custom_errors.js");
const ongoingGamesStore = require("../../games/ongoing_games_store");
const trustedServerData = require("../../config/trusted_server_data.json");
const botClientWrapper = require("../../discord/wrappers/bot_client_wrapper.js");
const MessagePayload = require("../../discord/prototypes/message_payload.js");
const onGameWentOffline = require("../../games/event_handlers/game_went_offline.js");

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

    var _capacity;
    var _socketWrapper;

    this.getName = () => _name;
    this.getId = () => _id;
    this.getIp = () => _ip;
    this.getSocketId = () => (_socketWrapper != null) ? _socketWrapper.getId() : null;
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

    this.isOnline = () => (_socketWrapper != null) ? _socketWrapper.isConnected() : false;
    
    this.initializeConnection = (socketWrapper, capacity) =>
    {
        this.setSocket(socketWrapper);
        this.setCapacity(capacity);
    };

    this.setSocket = (socketWrapper) => 
    {
        _socketWrapper = socketWrapper;

        _socketWrapper.onMessage("GAME_CLOSED", (data) =>
        {
            const game = ongoingGamesStore.getOngoingGameByName(data.gameName);
            const code = data.code;
            const signal = data.signal;

            if (game == null || data == null)
                return;

            onGameWentOffline(game, code, signal);
        });

        _socketWrapper.onMessage("GAME_UPDATE", (data) =>
        {
            const game = ongoingGamesStore.getOngoingGameByName(data.gameName);

            if (game == null || data == null)
                return log.error(log.getLeanLevel(), `Received update for game ${data.gameName} from server ${this.getName()} that is not in master store. Data:`, data);

            gameMonitor.updateDom5Game(game, data);
        });

        _socketWrapper.onClose((code, reason) =>
        {
            log.general(log.getLeanLevel(), `Server ${this.getName()} disconnected (code: ${code}, reason: ${reason})`);
            botClientWrapper.messageDev(new MessagePayload(`Server ${this.getName()} disconnected (code: ${code}, reason: ${reason})`));
        });
    };
    
    this.setCapacity = (capacity) =>
    {
        if (assert.isInteger(capacity) === true && capacity >= 0)
            _capacity = capacity;
    };

    this.emitPromise = (...args) => 
    {
        if (this.isOnline() === false)
            return Promise.reject(new SocketResponseError(`Server is offline.`));

        return _socketWrapper.emitPromise(...args);
    };

    this.onDisconnect = (fnToCall) => _socketWrapper.onClose(fnToCall);
    this.onMessage = (...args) => _socketWrapper.onMessage(...args);

    this.getAvailableSlots = () => this.getTotalCapacity() - this.getNbrOfGames();
    this.hasAvailableSlots = () => this.getAvailableSlots() > 0;

    this.getNbrOfGames = () =>
    {
        return ongoingGamesStore.getNbrOfGamesOnServer(this);
    };

    this.launchGames = () =>
    {
        const games = ongoingGamesStore.getOngoingGamesOnServer(this);

        log.general(log.getNormalLevel(), `Launching ${games.length} games hosted on ${this.getName()}`);

        games.forEach((game) =>
        {
            game.launch()
            .then(() => log.general(log.getNormalLevel(), `${this.getName()} - ${game.getName()} launched!`))
            .catch((err) => log.error(log.getLeanLevel(), `${this.getName()} - ${game.getName()} LAUNCH ERROR`, err));
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