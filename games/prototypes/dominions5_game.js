
const Game = require("./game.js");
const config = require("../../config/config.json");
const Dominions5Settings = require("./dominions5_settings.js");
const Dominions5CurrentTimer = require("./dominions5_current_timer.js");

module.exports = Dominions5Game;

function Dominions5Game()
{
    const _gameObject = new Game();
    const _currentTimer = new Dominions5CurrentTimer();
    var _intervalFunctionId;

    _gameObject.setSettingsObject(new Dominions5Settings(_gameObject));

    _gameObject.getGameType = () => config.dom5GameTypeName;
    _gameObject.getCurrentTimerObject = () => _currentTimer;
    _gameObject.getDataPackage = () => _createGameDataPackage();

    _gameObject.fetchStatusDump = () => _emitMessageToServer("GET_STATUS_DUMP");
    _gameObject.fetchScoreDumpBuffer = () => _emitMessageToServer("GET_SCORE_DUMP");
    _gameObject.fetchSubmittedPretenders = () => _emitMessageToServer("GET_SUBMITTED_PRETENDERS");
    _gameObject.fetchNationTurnFile = (nationFilename) => _emitMessageToServer("GET_NATION_TURN_FILE", {nationFilename});

    _gameObject.deleteGameSavefiles = () => _emitMessageToServer("DELETE_GAME_SAVE_FILES");

    _gameObject.launchProcess = () =>
    {
        const dataPackage = _createGameDataPackage();

        return _emitMessageToServer("LAUNCH_GAME", dataPackage);
    };

    _gameObject.killProcess = () =>
    {
        const dataPackage = _createGameDataPackage();

        return _emitMessageToServer("KILL_GAME", dataPackage);
    };

    _gameObject.changeCurrentTimer = (ms) =>
    {
        const dataPackage = _createGameDataPackage();
        dataPackage.timer = ms;

        return _emitMessageToServer("changeCurrentTimer", dataPackage);
    };

    _gameObject.addTimeToCurrentTimer = (ms) =>
    {
        const dataPackage = _createGameDataPackage();
        dataPackage.timer = ms + _currentTimer.getLastKnownMsLeft();

        return _emitMessageToServer("changeCurrentTimer", dataPackage);
    };

    _gameObject.changeDefaultTimer = (ms) =>
    {
        const dataPackage = _createGameDataPackage();
        dataPackage.timer = ms;

        return _emitMessageToServer("changeDefaultTimer", dataPackage);
    };

    _gameObject.addTimeToDefaultTimer = (ms) =>
    {
        const dataPackage = _createGameDataPackage();
        dataPackage.timer = ms + _currentTimer.getDefaultTimerInMs();

        return _emitMessageToServer("changeCurrentTimer", dataPackage);
    };

    _gameObject.getScoresFile = () =>
    {
        const dataPackage = _createGameDataPackage();

        return _emitMessageToServer("getScoreDumpBuffer", dataPackage);
    };

    _gameObject.getCurrentTurnFileOfPlayer = (playerId) =>
    {
        //TODO: determine how to identify which nation a player uses
        //Where is player data stored?
    };

    _gameObject.isPlayerOwnerOfPretender = (guildMemberWrapper, nameOfNation) =>
    {

    };

    _gameObject.removePretender = (nameOfNation) =>
    {

    };

    _gameObject.substitutePlayer = (nameOfNation, idOfNewPlayer) =>
    {

    };

    _gameObject.startGame = () =>
    {
        const dataPackage = _createGameDataPackage();

        return _emitMessageToServer("startGame", dataPackage);
    };

    _gameObject.restartGame = () =>
    {
        const dataPackage = _createGameDataPackage();

        return _emitMessageToServer("restartGame", dataPackage)
        .then(() =>
        {
            /*TODO: set hasStarted to false*/
        });
    };

    _gameObject.rollbackTurn = () =>
    {
        const dataPackage = _createGameDataPackage();

        return _emitMessageToServer("rollback", dataPackage)
    };

    _gameObject.startUpdating = (interval) => _intervalFunctionId = setInterval(_currentTimer.updateTimer, interval);
    _gameObject.stopUpdating = () => clearInterval(_intervalFunctionId);

    function _emitMessageToServer(message, dataObjectToSend)
    {
        const gameName = _gameObject.getName();
        const server = _gameObject.getServer();
        const dataPackage = Object.assign({name: gameName}, dataObjectToSend);

        return server.emitPromise(message, dataPackage);
    }

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

    function _validatePretenders()
    {
        //TODO: Is this really needed?
    }

    _currentTimer.setNewTurnHandler = () =>
    {
        //TODO: announce new turn to channel
        //send stales to host
        //send score files to players
        //send turn backup to players
    };

    _currentTimer.setNewHourHandler = () =>
    {
        //TODO
    };

    _currentTimer.setLastHourHandler = () =>
    {
        //TODO: announce last hour to channel
    };

    return _gameObject;
}

