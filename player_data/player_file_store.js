
const fsp = require("fs").promises;
const log = require("../logger.js");
const asserter = require("../asserter.js");
const config = require("../config/config.json");
const PlayerFile = require("./prototypes/player_file.js");
const gameStore = require("../games/ongoing_games_store.js");

const _playerFileStore = {};


exports.populate = () =>
{
    return fsp.readdir(`${config.dataPath}/${config.playerDataFolder}`)
    .then((filenames) =>
    {
        return filenames.forAllPromises((filename) =>
        {
            fsp.readFile(`${config.dataPath}/${config.playerDataFolder}/${filename}`, "utf8")
            .then((fileData) =>
            {
                const parsedJSON = JSON.parse(fileData);
                const playerFile = PlayerFile.loadFromJSON(parsedJSON);
                _playerFileStore[playerFile.getId()] = playerFile;
            })
            .catch((err) => Promise.reject(err));
        });
    })
    .catch((err) => Promise.reject(err));
};

exports.clearObsoleteData = () =>
{
    return _playerFileStore.forAllPromises((playerFile, playerId) =>
    {
        let wasDataCleared = false;
        const gameDataList = playerFile.getAllGameData();

        gameDataList.forEachItem((gameData, gameName) =>
        {
            if (gameStore.hasOngoingGameByName(gameName) === false)
            {
                playerFile.removeGameData(gameName);
                playerFile.removeGamePreferences(gameName);
                wasDataCleared = true;
            }
        });

        if (wasDataCleared === false)
            return;
        
        return exports.savePlayerFile(playerId)
        .catch((err) => log.error(log.getLeanLevel(), `ERROR SAVING PRUNED PLAYER FILE ${playerId}`, err));
    });
};

exports.addPlayerFile = (playerId) =>
{
    asserter.isValidDiscordIdOrThrow(playerId);
    _playerFileStore[playerId] = new PlayerFile(playerId);
    log.general(log.getLeanLevel(), `Player file ${playerId} added to store.`);
};

exports.savePlayerFile = (playerId) =>
{
    const playerFile = _getPlayerFile(playerId);

    if (exports.hasPlayerFile(playerId) === false)
        return Promise.resolve();

    return playerFile.save();
};

exports.deletePlayerFile = (playerId) =>
{
    const filePath = `${config.dataPath}/${config.playerDataFolder}/${playerId}.json`;

    if (exports.hasPlayerFile(playerId) === false)
        return Promise.resolve();

    return Promise.resolve()
    .then(() =>
    {
        if (fs.existsSync(filePath) === true)
            return fsp.unlink(filePath);

        return Promise.resolve();
    })
    .then(() =>
    {
        delete _playerFileStore[playerId];
        return Promise.resolve();
    })
    .catch((err) => Promise.reject(err));
};

exports.hasPlayerFile = (playerId) =>
{
    return _playerFileStore[playerId] != null;
};

exports.getPlayerFile = (playerId) =>
{
    return _getPlayerFile(playerId);
};


exports.isPlayerInGame = (playerId, gameName) => 
{
    log.general(log.getVerboseLevel(), `Player ${playerId} is in game ${gameName}`, _getGameData(playerId, gameName));
    return _getGameData(playerId, gameName) != null;
};


exports.isPlayerReceivingScoresGlobal = (playerId) =>
{
    const globalPreferences = _getGlobalPreferences(playerId);
    return globalPreferences.isReceivingScores();
};

exports.setPlayerReceivesScoresGlobal = (playerId, boolean) =>
{
    const globalPreferences = _getGlobalPreferences(playerId);
    return globalPreferences.setReceiveScores(boolean);
};


exports.isPlayerReceivingBackupsGlobal = (playerId) =>
{
    const globalPreferences = _getGlobalPreferences(playerId);
    return globalPreferences.isReceivingBackups();
};

exports.setPlayerReceivesBackupsGlobal = (playerId, boolean) =>
{
    const globalPreferences = _getGlobalPreferences(playerId);
    return globalPreferences.setReceiveBackups(boolean);
};


exports.isPlayerReceivingRemindersWhenTurnIsDoneGlobal = (playerId) =>
{
    const globalPreferences = _getGlobalPreferences(playerId);
    return globalPreferences.isReceivingRemindersWhenTurnIsDone();
};

exports.setPlayerReceivesRemindersWhenTurnIsDone = (playerId, boolean) =>
{
    const globalPreferences = _getGlobalPreferences(playerId);
    return globalPreferences.setReceiveRemindersWhenTurnIsDone(boolean);
};


exports.doesPlayerHaveReminderAtHourMarkGlobal = (playerId, hourMark) =>
{
    const globalPreferences = _getGlobalPreferences(playerId);
    return globalPreferences.hasReminderAtHourMark(hourMark);
};

exports.addPlayerReminderAtHourMarkGlobal = (playerId, hourMark) =>
{
    const globalPreferences = _getGlobalPreferences(playerId);
    return globalPreferences.addReminderAtHourMark(hourMark);
};

exports.removePlayerReminderAtHourMarkGlobal = (hourMark, playerId) =>
{
    const globalPreferences = _getGlobalPreferences(playerId);
    return globalPreferences.removeReminderAtHourMark(hourMark);
};


function _getPlayerFile(playerId)
{
    log.general(log.getVerboseLevel(), `Getting player file for ${playerId}...`);
    _createEmptyPlayerFileIfNoneExists(playerId);
    return _playerFileStore[playerId];
}

function _createEmptyPlayerFileIfNoneExists(playerId)
{
    if (exports.hasPlayerFile(playerId) === false)
    {
        log.general(log.getVerboseLevel(), `Player file does not exist; creating new one...`);
        exports.addPlayerFile(playerId);
    }
}

function _getGlobalPreferences(playerId)
{
    const playerFile = _getPlayerFile(playerId);

    if (playerFile == null)
        return null;
        
    return playerFile.getGlobalPreferences();
}

function _getGameData(playerId, gameName)
{
    const playerFile = _getPlayerFile(playerId);

    if (playerFile == null)
        return null;

    return playerFile.getGameData(gameName);
}

function _getGamePreferences(playerId, gameName)
{
    const playerFile = _getPlayerFile(playerId);

    if (playerFile == null)
        return null;
        
    return playerFile.getGamePreferences(gameName);
}