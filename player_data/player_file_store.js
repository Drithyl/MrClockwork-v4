
const fsp = require("fs").promises;
const config = require("../config/config.json");
const PlayerFile = require("./prototypes/player_file.js");

const _playerFileStore = {};


exports.populate = () =>
{
    return fsp.readdir(config.pathToPlayerData)
    .then((filenames) =>
    {
        return filenames.forEachPromise((filename, index, nextPromise) =>
        {
            fsp.readFile(`${config.pathToPlayerGameData}/${filename}`, "utf8")
            .then((fileData) =>
            {
                const parsedJSON = JSON.parse(fileData);
                const playerFile = PlayerFile.loadFromJSON(parsedJSON);

                _playerGameDataStore[playerFile.getId()] = playerFile;
                return nextPromise();
            })
            .catch((err) => Promise.reject(err));
        });
    })
    .catch((err) => Promise.reject(err));
};


exports.addPlayerFile = (playerId) =>
{
    _playerFileStore[playerId] = new PlayerFile(playerId);
};

exports.savePlayerFile = (playerId) =>
{
    const filePath = `${config.pathToPlayerGameData}/${playerId}`;
    const playerFile = _getPlayerFile(playerId);

    if (exports.hasPlayerFile(playerId) === false)
        return Promise.resolve();

    return fsp.writeFile(filePath, playerFile.toJSON())
    .catch((err) => Promise.reject(err));
};

exports.deletePlayerFile = (playerId) =>
{
    const filePath = `${config.pathToPlayerGameData}/${playerId}`;

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
    return _getPlayerFile(playerId) != null;
};

exports.getPlayerFile = (playerId) =>
{
    return _getPlayerFile(playerId);
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


exports.isPlayerReceivingScoresInGame = (playerId, gameName) =>
{
    const gamePreferences = _getGamePreferences(playerId, gameName);
    return gamePreferences.isReceivingScoresInGame();
};

exports.setPlayerReceivesScoresInGame = (playerId, gameName, boolean) =>
{
    const gamePreferences = _getGamePreferences(playerId, gameName);
    return gamePreferences.setReceiveScores(boolean);
};


exports.isPlayerReceivingBackupsInGame = (playerId, gameName) =>
{
    const gamePreferences = _getGamePreferences(playerId, gameName);
    return gamePreferences.isReceivingBackupsInGame();
};

exports.setPlayerReceivesBackupsInGame = (playerId, gameName, boolean) =>
{
    const gamePreferences = _getGamePreferences(playerId, gameName);
    return gamePreferences.setReceiveBackups(boolean);
};


exports.isPlayerReceivingRemindersWhenTurnIsDoneInGame = (playerId, gameName) =>
{
    const gamePreferences = _getGamePreferences(playerId, gameName);
    return gamePreferences.isReceivingRemindersWhenTurnIsDoneInGame();
};

exports.setPlayerReceivesRemindersWhenTurnInGame = (playerId, gameName, boolean) =>
{
    const gamePreferences = _getGamePreferences(playerId, gameName);
    return gamePreferences.setReceiveRemindersWhenTurnIsDone(boolean);
};


exports.doesPlayerHaveReminderAtHourMarkInGame = (playerId, gameName, hourMark) =>
{
    const gamePreferences = _getGamePreferences(playerId, gameName);
    return gamePreferences.hasReminderAtHourMarkInGame(hourMark);
};

exports.addPlayerReminderAtHourMarkInGame = (playerId, gameName, hourMark) =>
{
    const gamePreferences = _getGamePreferences(playerId, gameName);
    return gamePreferences.addReminderAtHourMark(hourMark);
};

exports.removePlayerReminderAtHourMarkInGame = (playerId, gameName, hourMark) =>
{
    const gamePreferences = _getGamePreferences(playerId, gameName);
    return gamePreferences.removeReminderAtHourMark(hourMark);
};


exports.isPlayerInGameControllingNation = (playerId, gameName, nationFilename) =>
{
    const gameData = _getGameData(playerId, gameName);
    return gameData.isNationControlledByPlayer(nationFilename);
};

exports.getPlayerIdInGameControllingNation = (gameName, nationFilename) =>
{
    for (var playerId in _playerFileStore)
    {
        const gameData = _getGameData(playerId, gameName);

        if (gameData.isNationControlledByPlayer(player, nationFilename) === true)
            return playerId;
    }

    return null;
};

exports.addPlayerControlledNationInGame = (playerId, nationFilename, gameName) =>
{
    const playerFile = _createEmptyPlayerFileIfNoneExists(playerId);
    var gameData = _getGameData(playerId, gameName);

    if (gameData == null)
        gameData = playerFile.addGameData(gameName);

    return gameData.addControlledNation(nationFilename);
};

exports.removePlayerControlOfNationInGame = (playerId, nationFilename, gameName) =>
{
    const gameData = _getGameData(playerId, gameName);
    return gameData.removePlayerControlOfNation(nationFilename);
};

function _createEmptyPlayerFileIfNoneExists(playerId)
{
    if (exports.hasPlayerFile(playerId) === false)
        exports.addPlayerFile(playerId);

    return _getPlayerFile(playerId);
}

function _getPlayerFile(playerId)
{
    return _playerFileStore[playerId];
}

function _getGlobalPreferences(playerId)
{
    const playerFile = _getPlayerFile(playerId);
    return playerFile.getGlobalPreferences();
}

function _getGameData(playerId, gameName)
{
    const playerFile = _getPlayerFile(playerId);
    return playerFile.getGameData(gameName);
}

function _getGamePreferences(playerId, gameName)
{
    const gameData = _getGameData(playerId, gameName);
    return gameData.getDominionsPreferences();
}