
const Game = require("./game.js");
const log = require("../../logger.js");
const asserter = require("../../asserter.js");
const config = require("../../config/config.json");
const dominions5Status = require("./dominions5_status.js");
const ongoingGameStore = require("../ongoing_games_store.js");
const Dominions5Settings = require("./dominions5_settings.js");
const playerFileStore = require("../../player_data/player_file_store.js");
const Dominions5StatusEmbed = require("./dominions5_status_embed.js");

module.exports = Dominions5Game;

function Dominions5Game()
{
    const _gameObject = new Game();
    const _playerFiles = {};
    const _status = new dominions5Status.Dominions5Status();

    var _statusEmbed;
    var _isEnforcingTimer = true;

    _gameObject.setSettingsObject(new Dominions5Settings(_gameObject));

    _gameObject.getGameType = () => config.dom5GameTypeName;
    _gameObject.getDataPackage = () => _createGameDataPackage();

    _gameObject.getSubmittedNations = () => _gameObject.emitPromiseWithGameDataToServer("GET_SUBMITTED_PRETENDERS");

    _gameObject.checkIfNationIsSubmitted = (nationFilename) =>
    {
        return _gameObject.getSubmittedNations()
        .then((list) => Promise.resolve(list.find((nation) => nationFilename === nation.filename) != null));
    };

    _gameObject.forEachPlayerFile = (fnToCall) => _playerFiles.forEachItem((file, id) => fnToCall(file, id));

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

    _gameObject.deleteGame = () =>
    {
        return _gameObject.emitPromiseWithGameDataToServer("DELETE_GAME")
        .then(() => _gameObject.removeAllPlayerData(_gameObject.getName()))
        .then(() => ongoingGameStore.deleteGame(_gameObject.getName()));
    };

    _gameObject.removeAllPlayerData = () =>
    {
        return _playerFiles.forEachPromise((playerFile, playerId, nextPromise) =>
        {
            playerFile.removeGameData(_gameObject.getName());
            playerFile.removeGamePreferences(_gameObject.getName());
            log.general(log.getNormalLevel(), `Deleted ${playerId}'s ${_gameObject.getName()} data.`);

            return playerFile.save()
            .then(() => nextPromise());
        })
        .catch((err) =>
        {
            log.error(log.getLeanLevel(), `ERROR: Could not delete ${playerId}'s ${_gameObject.getName()} data`, err);
            return Promise.reject(err);
        });
    };

    _gameObject.substitutePlayerControllingNation = (idOfNewPlayer, nationFilename) =>
    {
        return _gameObject.removeControlOfNation(nationFilename)
        .then(() => _gameObject.claimNation(idOfNewPlayer, nationFilename));
    };

    _gameObject.getMsLeftPerTurn = () => 
    {
        const settingsObject = _gameObject.getSettingsObject();
        const timerSetting = settingsObject.getTimerSetting();
        const timeLeft = timerSetting.getValue();

        return timeLeft.getMsLeft();
    };

    _gameObject.changeTimer = (currentMs, defaultMs = null) =>
    {
        const settingsObject = _gameObject.getSettingsObject();
        const timerSetting = settingsObject.getTimerSetting();

        if (defaultMs == null)
            defaultMs = _gameObject.getMsLeftPerTurn();

        if (isNaN(defaultMs) === true || isNaN(currentMs) === true)
            return Promise.reject(new Error(`Timers must be expressed in ms; got ${defaultMs} and ${currentMs}.`));

        if (_gameObject.isEnforcingTimer() === true)
        {
            timerSetting.fromJSON(defaultMs);

            if (currentMs <= 0)
                return Promise.resolve(_status.setIsPaused(true));

            _status.setIsPaused(false);
            _status.setMsLeft(currentMs);
            return Promise.resolve();
        }

        else return _gameObject.emitPromiseWithGameDataToServer("CHANGE_TIMER", {
            timer: defaultMs,
            currentTimer: currentMs
        });
    };

    _gameObject.forceHost = () => _gameObject.emitPromiseWithGameDataToServer("FORCE_HOST");

    _gameObject.isEnforcingTimer = () => _isEnforcingTimer;
    _gameObject.switchTimerEnforcer = () => 
    {
        if (_gameObject.isEnforcingTimer() === true)
        {
            _isEnforcingTimer = false;
            return _gameObject.changeTimer(_status.getMsLeft())
            .then(() => Promise.resolve(_isEnforcingTimer));
        }

        _isEnforcingTimer = true;
        return Promise.resolve(_isEnforcingTimer);
    };

    _gameObject.launch = () => _gameObject.emitPromiseWithGameDataToServer("LAUNCH_GAME");
    _gameObject.kill = () => _gameObject.emitPromiseWithGameDataToServer("KILL_GAME");

    _gameObject.fetchStatusDump = () => _gameObject.emitPromiseWithGameDataToServer("GET_STATUS_DUMP");

    _gameObject.checkIfGameStarted = () => 
    {
        return dominions5Status.queryDominions5Game(_gameObject)
        .then((status) => Promise.resolve(status.isOngoing()));
    };

    _gameObject.getLastKnownStatus = () => 
    {
        const timerSetting = _gameObject.getSettingsObject().getTimerSetting();
        const timePerTurnObject = timerSetting.getValue();

        return _status;
    };

    _gameObject.update = (updatedStatus) => 
    {
        if (asserter.isInteger(updatedStatus.getMsLeft()) === true)
            _status.setMsLeft(updatedStatus.getMsLeft());

        if (asserter.isInteger(updatedStatus.getLastTurnTimestamp()) === true)
            _status.setLastTurnTimestamp(updatedStatus.getLastTurnTimestamp());

        if (asserter.isInteger(updatedStatus.getTurnNumber()) === true)
            _status.setTurnNumber(updatedStatus.getTurnNumber());

        if (asserter.isString(updatedStatus.getStatus()) === true)
            _status.setStatus(updatedStatus.getStatus());

        if (asserter.isArray(updatedStatus.getPlayers()) === true)
            _status.setPlayers(updatedStatus.getPlayers());

        _status.setLastUpdateTimestamp(Date.now());

        return _status;
    };

    _gameObject.sendStatusEmbed = () => 
    {
        return Dominions5StatusEmbed.sendNew(_gameObject)
        .then((statusEmbed) =>
        {
            _statusEmbed = statusEmbed;
            return Promise.resolve();
        });
    };

    _gameObject.updateStatusEmbed = (updatedStatus) => 
    {
        if (_statusEmbed != null)
            _statusEmbed.update(updatedStatus, _isEnforcingTimer)
            .catch((err) => log.error(log.getVerboseLevel(), `ERROR UPDATING ${_gameObject.getName()}'S EMBED`, err));

        else if (_gameObject.getChannel() != null)
            _gameObject.sendStatusEmbed()
            .then(() => _gameObject.save())
            .catch((err) => log.error(log.getVerboseLevel(), `ERROR SENDING ${_gameObject.getName()}'S EMBED`, err));
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

        if (asserter.isObject(jsonData.status) === true)
            _status.fromJSON(jsonData.status);

        if (asserter.isBoolean(jsonData.isEnforcingTimer) === true)
            _isEnforcingTimer = jsonData.isEnforcingTimer;

        if (Array.isArray(jsonData.playerData) === true)
        {
            jsonData.playerData.forEach((playerId) =>
            {
                _playerFiles[playerId] = playerFileStore.getPlayerFile(playerId);
            });
        }

        if (jsonData.statusEmbedId != null && _gameObject.getChannel() != null)
        {
            Dominions5StatusEmbed.loadExisting(_gameObject.getChannel(), jsonData.statusEmbedId)
            .then((statusEmbed) => 
            {
                _statusEmbed = statusEmbed;
                return Promise.resolve();
            })
            .catch((err) => log.error(log.getLeanLevel(), `ERROR LOADING ${_gameObject.getName()}'S EMBED`, err));
        }

        return _gameObject;
    };

    _gameObject.toJSON = () =>
    {
        const jsonData = _gameObject.toJSONSuper();

        jsonData.status = _status.toJSON();

        if (_statusEmbed != null)
            jsonData.statusEmbedId = _statusEmbed.getMessageId();
            
        jsonData.isEnforcingTimer = _isEnforcingTimer;

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
            gameType: _gameObject.getGameType(),
            args: settingsObject.getSettingFlags()
        };

        if (_gameObject.isEnforcingTimer() === false)
        {
            dataPackage.timer = defaultTime.getMsLeft();
            dataPackage.currentTimer = _status.getMsLeft();
        }

        return dataPackage;
    }

    return _gameObject;
}

