
const Game = require("./game.js");
const log = require("../../logger.js");
const assert = require("../../asserter.js");
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
    var _isCurrentTurnRollback = false;

    _gameObject.setSettingsObject(new Dominions5Settings(_gameObject));

    _gameObject.getGameType = () => config.dom5GameTypeName;
    _gameObject.getDataPackage = () => _createGameDataPackage();

    _gameObject.fetchSubmittedNations = () =>
    {
        const guildWrapper = _gameObject.getGuild();

        return _gameObject.emitPromiseWithGameDataToServer("GET_SUBMITTED_PRETENDERS")
        .then((nationArray) =>
        {
            if (assert.isArray(nationArray) === false)
                return Promise.reject(new Error(`List of pretenders is unavailable; try again later.`));

            return nationArray.forAllPromises((nation) =>
            {
                const pretenderOwnerId = _gameObject.getPlayerIdControllingNationInGame(nation.filename);

                if (pretenderOwnerId == null)
                    return;

                return guildWrapper.fetchGuildMemberWrapperById(pretenderOwnerId)
                .then((pretenderOwnerMember) => nation.owner = pretenderOwnerMember);
            })
            .then(() => Promise.resolve(nationArray));
        });
    };

    _gameObject.fetchSubmittedNationFilename = (nationIdentifier) =>
    {
        return _gameObject.fetchSubmittedNations()
        .then((nationArray) =>
        {
            const foundNation = nationArray.find((nation) => 
            {
                if (nationIdentifier === nation.filename)
                    return true;
                
                else if (+nationIdentifier === +nation.nationNbr)
                    return true;
            });

            if (foundNation == null)
                return null;

            else return foundNation.filename;
        });
    };

    _gameObject.checkIfNationIsSubmitted = (nationIdentifier) =>
    {
        return _gameObject.fetchSubmittedNationFilename(nationIdentifier)
        .then((filename) => Promise.resolve(filename != null));
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
        if (_playerFiles[playerId] == null)
            return false;
            
        const playerFile = _playerFiles[playerId];
        return playerFile.isControllingNationInGame(nationIdentifier, _gameObject.getName());
    };

    _gameObject.claimNation = (playerId, nationFilename) => 
    {
        if (_playerFiles[playerId] == null)
        {
            log.general(log.getLeanLevel(), `Player ${playerId} is new to the game; adding to list.`);
            _playerFiles[playerId] = playerFileStore.getPlayerFile(playerId);
        }

        log.general(log.getLeanLevel(), `Player ${playerId} is claiming nation ${nationFilename}...`);
        return _playerFiles[playerId].addControlledNationInGame(nationFilename, _gameObject.getName());
    };

    _gameObject.removeControlOfNation = (nationFilename) => 
    {
        const playerId = _gameObject.getPlayerIdControllingNationInGame(nationFilename);
        const playerFile = _playerFiles[playerId];

        // No player controls the nation, no need to do anything
        if (playerFile == null)
            return Promise.resolve();

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
        return _playerFiles.forAllPromises((playerFile) =>
        {
            return playerFile.removeControlOfAllNationsInGame(_gameObject.getName());
        });
    };

    _gameObject.deleteGame = () =>
    {
        return ongoingGameStore.deleteGame(_gameObject.getName())
        .then(() => _gameObject.removeAllPlayerData(_gameObject.getName()))
        .then(() => _gameObject.emitPromiseWithGameDataToServer("DELETE_GAME"));
    };

    _gameObject.removeAllPlayerData = () =>
    {
        return _playerFiles.forAllPromises((playerFile, playerId) =>
        {
            playerFile.removeGameData(_gameObject.getName());
            playerFile.removeGamePreferences(_gameObject.getName());
            log.general(log.getNormalLevel(), `Deleted ${playerId}'s ${_gameObject.getName()} data.`);
            return playerFile.save();
        })
        .catch((err) =>
        {
            log.error(log.getLeanLevel(), `ERROR: Could not delete some of ${_gameObject.getName()}'s player's data`, err);
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

    _gameObject.isCurrentTurnRollback = () => _isCurrentTurnRollback;
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

    _gameObject.hasGameStarted = () => 
    {
        if (_status == null)
            throw new Error("Last known status is not available.");

        return _status.isOngoing();
    };

    _gameObject.getLastKnownStatus = () => _status;

    _gameObject.update = (updatedStatus) => 
    {
        if (assert.isInteger(updatedStatus.getMsLeft()) === true)
            _status.setMsLeft(updatedStatus.getMsLeft());

        if (assert.isInteger(updatedStatus.getLastTurnTimestamp()) === true)
            _status.setLastTurnTimestamp(updatedStatus.getLastTurnTimestamp());

        if (assert.isInteger(updatedStatus.getLastUpdateTimestamp()) === true)
            _status.setLastUpdateTimestamp(updatedStatus.getLastUpdateTimestamp());

        if (assert.isInteger(updatedStatus.getTurnNumber()) === true)
            _status.setTurnNumber(updatedStatus.getTurnNumber());

        if (assert.isString(updatedStatus.getStatus()) === true)
            _status.setStatus(updatedStatus.getStatus());

        if (assert.isArray(updatedStatus.getPlayers()) === true)
            _status.setPlayers(updatedStatus.getPlayers());

        if (updatedStatus.isNewTurn === true)
        {
            _isCurrentTurnRollback = false;
            log.general(log.getNormalLevel(), `${_gameObject.getName()}\t_isCurrentRollback set to ${_isCurrentTurnRollback}`);
        }

        else if (updatedStatus.wasTurnRollbacked === true)
        {
            _isCurrentTurnRollback = true;
            log.general(log.getNormalLevel(), `${_gameObject.getName()}\t_isCurrentRollback set to ${_isCurrentTurnRollback}`);
        }

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
            _statusEmbed.update(_gameObject, updatedStatus, _isEnforcingTimer)
            .catch((err) => log.error(log.getVerboseLevel(), `ERROR UPDATING ${_gameObject.getName()}'S EMBED`, err));

        else if (_gameObject.getChannel() != null)
            _gameObject.sendStatusEmbed()
            .catch((err) => log.error(log.getVerboseLevel(), `ERROR SENDING ${_gameObject.getName()}'S EMBED`, err));
    };

    _gameObject.emitPromiseWithGameDataToServer = (message, additionalDataObjectToSend) =>
    {
        const dataPackage = _createGameDataPackage();
        Object.assign(dataPackage, additionalDataObjectToSend);

        return _gameObject.emitPromiseToServer(message, dataPackage);
    };

    _gameObject.loadJSONData = async (jsonData) =>
    {
        await _gameObject.loadJSONDataSuper(jsonData);


        log.general(log.getLeanLevel(), `${jsonData.name}: loading game status...`);

        if (assert.isObject(jsonData.status) === true)
            _status.fromJSON(jsonData.status);

        if (assert.isBoolean(jsonData.isEnforcingTimer) === true)
            _isEnforcingTimer = jsonData.isEnforcingTimer;

        if (assert.isBoolean(jsonData.isCurrentTurnRollback) === true)
            _isCurrentTurnRollback = jsonData.isCurrentTurnRollback;


        if (Array.isArray(jsonData.playerData) === true)
        {
            log.general(log.getLeanLevel(), `${jsonData.name}: loading player data...`);
            jsonData.playerData.forEach((playerId) =>
            {
                log.general(log.getLeanLevel(), `${jsonData.name}: getting player data of ${playerId}...`);
                _playerFiles[playerId] = playerFileStore.getPlayerFile(playerId);
                log.general(log.getLeanLevel(), `${jsonData.name}: ${playerId} player data loaded`);
            });
            log.general(log.getLeanLevel(), `${jsonData.name}: finished loading player data`);
        }

        try
        {
            if (jsonData.statusEmbedId != null && _gameObject.getChannel() != null)
            {
                log.general(log.getLeanLevel(), `${jsonData.name}: loading existing status embed...`);
                _statusEmbed = await Dominions5StatusEmbed.loadExisting(_gameObject.getChannel(), jsonData.statusEmbedId);
                log.general(log.getLeanLevel(), `${jsonData.name}: loaded existing message wrapper`);
            }
        }

        catch(err)
        {
            log.error(log.getLeanLevel(), `ERROR LOADING ${_gameObject.getName()}'S EMBED`, err)
        }

        log.general(log.getLeanLevel(), `${jsonData.name}: finished loading all JSON data`);

        return _gameObject;
    };

    _gameObject.toJSON = () =>
    {
        const jsonData = _gameObject.toJSONSuper();

        jsonData.status = _status.toJSON();

        if (_statusEmbed != null)
            jsonData.statusEmbedId = _statusEmbed.getMessageId();
            
        jsonData.isEnforcingTimer = _isEnforcingTimer;
        jsonData.isCurrentTurnRollback = _isCurrentTurnRollback;

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

