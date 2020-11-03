
const Game = require("./game.js");
const config = require("../../config/config.json");
const Dominions5Settings = require("./dominions5_settings.js");
const dominions5TcpQuery = require("./dominions5_tcp_query.js");
const playerFileStore = require("../../player_data/player_file_store.js");

module.exports = Dominions5Game;

function Dominions5Game()
{
    const _gameObject = new Game();
    
    var _lastKnownStatus;
    var _lastKnownTurnNumber;
    var _lastKnownMsToNewTurn;

    _gameObject.setSettingsObject(new Dominions5Settings(_gameObject));


    _gameObject.getGameType = () => config.dom5GameTypeName;
    _gameObject.getDataPackage = () => _createGameDataPackage();
    _gameObject.getPlayerControllingNationInGame = (nationIdentifier) =>
    {
        const controllerId = playerFileStore.getPlayerIdInGameControllingNation(_gameObject.getName(), nationIdentifier);
        return controllerId;
    };


    _gameObject.memberIsPlayer = (memberId) => playerFileStore.isPlayerInGame(memberId, _gameObject.getName());
    _gameObject.isPlayerControllingNation = (playerId, nationIdentifier) => playerFileStore.isPlayerInGameControllingNation(playerId, _gameObject.getName(), nationIdentifier);

    _gameObject.claimNation = (playerId, nationFilename) => 
    {
        playerFileStore.addPlayerControlledNationInGame(playerId, nationFilename, _gameObject.getName());
        return playerFileStore.savePlayerFile(playerId);
    };

    _gameObject.removeControlOfNation = (nationFilename) => playerFileStore.removePlayerControlOfNationInGame(nationFilename, _gameObject.getName());
    _gameObject.substitutePlayerControllingNation = (idOfNewPlayer, nationFilename) =>
    {
        return _gameObject.removeControlOfNation(nationFilename)
        .then(() => _gameObject.claimNation(idOfNewPlayer, nationFilename));
    };

    _gameObject.fetchStatusDump = () => _gameObject.emitPromiseWithGameDataToServer("GET_STATUS_DUMP");

    _gameObject.checkIfGameStarted = () => 
    {
        return dominions5TcpQuery(_gameObject)
        .then((tcpQuery) => Promise.resolve(tcpQuery.isInLobby() === false));
    };

    _gameObject.update = () => 
    {
        const lastKnownStatus = _lastKnownStatus;
        const lastKnownTurnNumber = _lastKnownTurnNumber;
        const lastKnownMsLeft = _lastKnownMsToNewTurn;

        return dominions5TcpQuery(_gameObject)
        .then((tcpQuery) =>
        {
            _lastKnownMsToNewTurn = tcpQuery.msLeft;
            _lastKnownTurnNumber = tcpQuery.turnNumber;
            _lastKnownStatus = tcpQuery.status;

            return Promise.resolve({
                lastKnownStatus,
                lastKnownTurnNumber,
                lastKnownMsLeft,
                currentStatus: tcpQuery.status,
                currentTurnNumber: tcpQuery.turnNumber,
                currentMsLeft: tcpQuery.msLeft,
            });
        });
    };

    _gameObject.emitPromiseWithGameDataToServer = (message, additionalDataObjectToSend) =>
    {
        const dataPackage = _createGameDataPackage();
        Object.assign(dataPackage, additionalDataObjectToSend);

        return _gameObject.emitPromiseToServer(message, dataPackage);
    };

    _gameObject.loadJSONData = (jsonData) =>
    {
        _gameObject.loadJSONDataSuper(jsonData);

        if (typeof jsonData.lastKnownStatus === "string")
            _lastKnownStatus = jsonData.lastKnownStatus;

        if (isNaN(jsonData.lastKnownTurnNumber) === false)
            _lastKnownTurnNumber = jsonData.lastKnownTurnNumber;

        if (jsonData.lastKnownMsToNewTurn >= 0)
            _lastKnownMsToNewTurn = jsonData.lastKnownMsToNewTurn;

        return _gameObject;
    };

    _gameObject.toJSON = () =>
    {
        const jsonData = _gameObject.toJSONSuper();

        jsonData.lastKnownStatus = _lastKnownStatus;
        jsonData.lastKnownTurnNumber = _lastKnownTurnNumber;
        jsonData.lastKnownMsToNewTurn = _lastKnownMsToNewTurn;

        return jsonData;
    };

    function _createGameDataPackage()
    {
        var settingsObject = _gameObject.getSettingsObject();
        
        const dataPackage = {
            name: _gameObject.getName(),
            port: _gameObject.getPort(),
            gameType: _gameObject.getGameType(),
            args: settingsObject.getSettingFlags()
        };

        return dataPackage;
    }

    return _gameObject;
}

