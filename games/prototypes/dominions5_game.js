
const Game = require("./game.js");
const config = require("../../config/config.json");
const Dominions5Settings = require("./dominions5_settings.js");
const dominions5TcpQuery = require("./dominions5_tcp_query.js");
const playerFileStore = require("../../player_data/player_file_store.js");

module.exports = Dominions5Game;

function Dominions5Game()
{
    const _gameObject = new Game();
    const _playerFiles = {};

    var _lastKnownStatus;
    var _lastKnownTurnNumber;
    var _lastKnownMsToNewTurn;

    _gameObject.setSettingsObject(new Dominions5Settings(_gameObject));

    _gameObject.getGameType = () => config.dom5GameTypeName;
    _gameObject.getDataPackage = () => _createGameDataPackage();

    _gameObject.getSubmittedNations = () => _gameObject.emitPromiseWithGameDataToServer("GET_SUBMITTED_PRETENDERS");

    _gameObject.checkIfNationIsSubmitted = (nationFilename) =>
    {
        return _gameObject.getSubmittedNations()
        .then((list) => Promise.resolve(list.find((nation) => nationFilename === nation.filename) != null));
    };

    _gameObject.getPlayerIdControllingNationInGame = (nationIdentifier) =>
    {
        for (var playerId in _playerFiles)
        {
            const playerFile = _playerFiles[playerId];

            if (playerFile.isControllingNationInGame(nationIdentifier, _gameObject.getName()) === true)
                return playerId;
        }
    };

    _gameObject.memberIsPlayer = (memberId) => _playerFiles[memberId] != null;

    _gameObject.isPlayerControllingNation = (playerId, nationIdentifier) => 
    {
        const playerFile = _playerFiles[playerId];
        return playerFile.isControllingNationInGame(nationIdentifier, _gameObject.getName());
    };

    _gameObject.claimNation = (playerId, nationFilename) => 
    {
        if (_playerFiles[playerId] == null)
            _playerFiles[playerId] = playerFileStore.getPlayerFile(playerId);

        return _playerFiles[playerId].addControlledNationInGame(nationFilename, _gameObject.getName());
    };

    _gameObject.removeControlOfNation = (nationFilename) => 
    {
        const playerId = _gameObject.getPlayerIdControllingNationInGame(nationFilename);
        const playerFile = _playerFiles[playerId];

        return playerFile.removeControlOfNationInGame(nationFilename, _gameObject.getName())
        .then(() =>
        {
            if (playerFile.hasGameData(_gameObject.getName()) === false)
                delete _playerFiles[playerId];

            return Promise.resolve();
        });
    };

    _gameObject.removeNationClaims = () =>
    {
        return _playerFiles.forEachPromise((playerFile, playerId, nextPromise) =>
        {
            return playerFile.removeControlOfAllNationsInGame(_gameObject.getName())
            .then(() => nextPromise());
        });
    };

    _gameObject.removeAllPlayerData = () =>
    {
        return _playerFiles.forEachPromise((playerFile, playerId, nextPromise) =>
        {
            playerFile.removeGameData(_gameObject.getName());
            playerFile.removeGamePreferences(_gameObject.getName());

            return playerFile.save()
            .then(() => nextPromise());
        });
    };

    _gameObject.substitutePlayerControllingNation = (idOfNewPlayer, nationFilename) =>
    {
        return _gameObject.removeControlOfNation(nationFilename)
        .then(() => _gameObject.claimNation(idOfNewPlayer, nationFilename));
    };

    _gameObject.changeTimer = (defaultMs, currentMs) =>
    {
        if (isNaN(defaultMs) === true || isNaN(currentMs) === true)
            return Promise.reject(new Error(`Timers must be expressed in ms; got ${defaultMs} and ${currentMs}.`));

        return _gameObject.emitPromiseWithGameDataToServer("CHANGE_TIMER", {
            timer: defaultMs,
            currentTimer: currentMs
        });
    };

    /** */
    _gameObject.launch = () =>
    {
        return _gameObject.emitPromiseWithGameDataToServer("LAUNCH_GAME");
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
                tcpQuery,
                lastKnownStatus,
                lastKnownTurnNumber,
                lastKnownMsLeft,
                currentStatus: tcpQuery.status,
                currentTurnNumber: tcpQuery.turnNumber,
                currentMsLeft: tcpQuery.msLeft
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

        if (Array.isArray(jsonData.playerData) === true)
        {
            jsonData.playerData.forEach((playerId) =>
            {
                _playerFiles[playerId] = playerFileStore.getPlayerFile(playerId);
            });
        }

        return _gameObject;
    };

    _gameObject.toJSON = () =>
    {
        const jsonData = _gameObject.toJSONSuper();

        jsonData.lastKnownStatus = _lastKnownStatus;
        jsonData.lastKnownTurnNumber = _lastKnownTurnNumber;
        jsonData.lastKnownMsToNewTurn = _lastKnownMsToNewTurn;

        jsonData.playerData = [];
        _playerFiles.forEachItem((playerFile, playerId) => jsonData.playerData.push(playerId));

        return jsonData;
    };

    function _createGameDataPackage()
    {
        const settingsObject = _gameObject.getSettingsObject();
        const timerSetting = settingsObject.getTimerSetting();
        const defaultTime = timerSetting.getValue();
        
        /** Include timer data as it is required for multiple server-side actions
         *  like launching a game task, changing the timer, etc.
         */
        const dataPackage = {
            name: _gameObject.getName(),
            port: _gameObject.getPort(),
            timer: defaultTime.getMsLeft(),
            currentTimer: _lastKnownMsToNewTurn,
            gameType: _gameObject.getGameType(),
            args: settingsObject.getSettingFlags()
        };

        return dataPackage;
    }

    return _gameObject;
}

