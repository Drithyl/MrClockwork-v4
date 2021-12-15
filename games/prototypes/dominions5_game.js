
const Game = require("./game.js");
const log = require("../../logger.js");
const assert = require("../../asserter.js");
const config = require("../../config/config.json");
const guildStore = require("../../discord/guild_store.js");
const dominions5Status = require("./dominions5_status.js");
const ongoingGameStore = require("../ongoing_games_store.js");
const Dominions5Settings = require("./dominions5_settings.js");
const playerFileStore = require("../../player_data/player_file_store.js");
const Dominions5StatusEmbed = require("./dominions5_status_embed.js");

module.exports = Dominions5Game;

function Dominions5Game()
{
    const _gameObject = new Game();
    const _playerData = {};
    const _status = new dominions5Status.Dominions5Status();

    var _statusEmbed;
    var _isEnforcingTimer = true;
    var _isCurrentTurnRollback = false;
    var _isTurnProcessing = false;

    _gameObject.setSettingsObject(new Dominions5Settings(_gameObject));

    _gameObject.getStatusEmbedId = () => (_statusEmbed != null) ? _statusEmbed.getMessageId() : null;
    _gameObject.getGameType = () => config.dom5GameTypeName;
    _gameObject.getDataPackage = () => _createGameDataPackage();

    _gameObject.fetchSubmittedNations = async () =>
    {
        const guild = _gameObject.getGuild();
        const nationArray = await _gameObject.emitPromiseWithGameDataToServer("GET_SUBMITTED_PRETENDERS");

        if (assert.isArray(nationArray) === false)
            return Promise.reject(new Error(`List of pretenders is unavailable; try again later.`));

        await nationArray.forEachPromise(async (nation, i, nextPromise) =>
        {
            const ownerId = _gameObject.getPlayerIdControllingNationInGame(nation.filename);
            const data = _playerData[ownerId];

            if (data == null)
                return nextPromise();
            
            try
            {
                if (data.username == null)
                {
                    log.general(log.getNormalLevel(), `Player ${data.id} username not found, fetching...`);
                    const member = await guild.fetchGuildMemberWrapperById(data.id);
                    data.username = member.getNameInGuild();
                    log.general(log.getNormalLevel(), `Username ${data.username} fetched.`);
                }
            }

            catch(err)
            {
                log.error(log.getNormalLevel(), `Could not fetch ${data.id}'s username`, err);
            }

            nation.owner = data.username;
            return nextPromise();
        });

        return nationArray;
    };

    _gameObject.fetchSubmittedNationFilename = async (nationIdentifier) =>
    {
        const nation = await _gameObject.emitPromiseWithGameDataToServer("GET_SUBMITTED_PRETENDER", { identifier: nationIdentifier });

        if (nation == null)
            return null;

        return nation.filename;
    };

    _gameObject.checkIfNationIsSubmitted = (nationIdentifier) =>
    {
        return _gameObject.fetchSubmittedNationFilename(nationIdentifier)
        .then((filename) => Promise.resolve(filename != null));
    };

    _gameObject.forEachPlayerFile = (fnToCall) => _playerData.forEachItem((data, id) => fnToCall(data.file, id, data.username));

    _gameObject.getPlayerIdControllingNationInGame = (nationIdentifier) =>
    {
        for (var playerId in _playerData)
        {
            const playerFile = _playerData[playerId].file;

            if (playerFile == null)
                continue;

            if (playerFile.isControllingNationInGame(nationIdentifier, _gameObject.getName()) === true)
                return playerId;
        }
    };

    _gameObject.memberIsPlayer = (memberId) => _playerData[memberId] != null;

    _gameObject.isPlayerControllingNation = (playerId, nationIdentifier) => 
    {
        if (_playerData[playerId] == null)
            return false;
            
        const playerFile = _playerData[playerId].file;
        return playerFile.isControllingNationInGame(nationIdentifier, _gameObject.getName());
    };

    _gameObject.updatePlayerLeftGuild = (memberId) => 
    {
        if (_playerData[memberId] == null)
            return;

        _playerData[memberId].username += " (left guild)";
    };

    _gameObject.updatePlayerUsername = (memberId, newUsername) => 
    {
        if (_playerData[memberId] == null)
            return;

        _playerData[memberId].username = newUsername;
    };

    _gameObject.setPlayer = (memberId, newUsername) => 
    {
        if (_playerData[memberId] == null)
            return;

        _playerData[memberId].username = newUsername;
    };

    _gameObject.claimNation = (guildMemberWrapper, nationFilename) => 
    {
        const playerId = guildMemberWrapper.getId();
        const username = guildMemberWrapper.getNameInGuild();

        if (_playerData[playerId] == null)
        {
            log.general(log.getLeanLevel(), `Player ${playerId} is new to the game; adding to list.`);
            _playerData[playerId] = { file: playerFileStore.getPlayerFile(playerId), id: playerId, username };
        }

        log.general(log.getLeanLevel(), `Player ${playerId} is claiming nation ${nationFilename}...`);
        return _playerData[playerId].file.addControlledNationInGame(nationFilename, _gameObject.getName());
    };

    _gameObject.removeControlOfNation = (nationFilename) => 
    {
        const playerId = _gameObject.getPlayerIdControllingNationInGame(nationFilename);
        const playerFile = (playerId != null) ? _playerData[playerId].file : null;

        // No player controls the nation, no need to do anything
        if (playerFile == null)
            return Promise.resolve();

        return playerFile.removeControlOfNationInGame(nationFilename, _gameObject.getName())
        .then(() =>
        {
            if (playerFile.hasGameData(_gameObject.getName()) === false)
                delete _playerData[playerId];

            return Promise.resolve();
        });
    };

    _gameObject.removeNationClaims = () =>
    {
        return _playerData.forAllPromises((playerData) =>
        {
            return playerData.file.removeControlOfAllNationsInGame(_gameObject.getName());
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
        return _playerData.forAllPromises((playerData, playerId) =>
        {
            playerData.file.removeGameData(_gameObject.getName());
            playerData.file.removeGamePreferences(_gameObject.getName());
            log.general(log.getNormalLevel(), `Deleted ${playerData.username} (${playerId})'s ${_gameObject.getName()} data.`);
            return playerData.file.save();
        })
        .catch((err) =>
        {
            log.error(log.getLeanLevel(), `ERROR: Could not delete some of ${_gameObject.getName()}'s player's data`, err);
            return Promise.reject(err);
        });
    };

    _gameObject.substitutePlayerControllingNation = (guildMemberWrapperOfNewPlayer, nationFilename) =>
    {
        return _gameObject.removeControlOfNation(nationFilename)
        .then(() => _gameObject.claimNation(guildMemberWrapperOfNewPlayer, nationFilename));
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

            if (currentMs > 0)
            {
                _status.setIsPaused(false);
                _status.setMsLeft(currentMs);
            }

            else _status.setIsPaused(true);

            return Promise.resolve();
        }

        else return _gameObject.emitPromiseWithGameDataToServer("CHANGE_TIMER", {
            timer: defaultMs,
            currentTimer: currentMs
        });
    };

    _gameObject.forceHost = () => 
    {
        _isTurnProcessing = true;
        return _gameObject.emitPromiseWithGameDataToServer("FORCE_HOST");
    };

    _gameObject.isCurrentTurnRollback = () => _isCurrentTurnRollback;
    _gameObject.isTurnProcessing = () => _isTurnProcessing;
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

    _gameObject.start = () =>
    {
        const channel = _gameObject.getChannel();
        const guildId = _gameObject.getGuildId();

        return _gameObject.emitPromiseWithGameDataToServer("START_GAME")
        .then(() =>
        {
            if (channel == null)
                return Promise.resolve();

            return channel.setParent(guildStore.getGameCategoryId(guildId));
        });
    };

    _gameObject.hasGameStarted = () => 
    {
        if (_status == null)
            throw new Error("Last known status is not available.");

        return _status.hasStarted();
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
            _isTurnProcessing = false;
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

    _gameObject.emitPromiseWithGameDataToServer = (message, additionalDataObjectToSend, timeout) =>
    {
        const dataPackage = _createGameDataPackage();
        Object.assign(dataPackage, additionalDataObjectToSend);

        return _gameObject.emitPromiseToServer(message, dataPackage, timeout);
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
            jsonData.playerData.forEach((playerData) =>
            {
                if (assert.isString(playerData) === true)
                {
                    log.general(log.getLeanLevel(), `${jsonData.name}: getting player data of ${playerData.username} (${playerData})...`);
                    _playerData[playerData] = { id: playerData, username: null, file: playerFileStore.getPlayerFile(playerData) };
                    log.general(log.getLeanLevel(), `${jsonData.name}: ${playerData}'s player data loaded`);
                }

                else
                {
                    log.general(log.getLeanLevel(), `${jsonData.name}: getting player data of ${playerData.username} (${playerData.id})...`);
                    _playerData[playerData.id] = { id: playerData.id, username: playerData.username, file: playerFileStore.getPlayerFile(playerData.id) };
                    log.general(log.getLeanLevel(), `${jsonData.name}: ${playerData.username} (${playerData.id})'s player data loaded`);
                }
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
        _playerData.forEachItem((playerData, id) => jsonData.playerData.push({ id, username: playerData.username }));

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
            args: settingsObject.getSettingFlags(),
            isCurrentTurnRollback: _isCurrentTurnRollback
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

