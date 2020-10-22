
const Game = require("./game.js");
const config = require("../../config/config.json");
const Dominions5Settings = require("./dominions5_settings.js");
const Dominions5CurrentTimer = require("./dominions5_current_timer.js");
const playerFileStore = require("../../player_data/player_file_store.js");

module.exports = Dominions5Game;

function Dominions5Game()
{
    const _gameObject = new Game();
    const _currentTimer = new Dominions5CurrentTimer();
    var _intervalFunctionId;

    _gameObject.setSettingsObject(new Dominions5Settings(_gameObject));

    _gameObject.getGameType = () => config.dom5GameTypeName;
    _gameObject.getDataPackage = () => _createGameDataPackage();
    _gameObject.getPlayerControllingNationInGame = (nationIdentifier) =>
    {
        const controllerId = playerFileStore.getPlayerIdInGameControllingNation(_gameObject.getName(), nationIdentifier);
        return controllerId;
    };
    
    _gameObject.isPlayerOwnerOfPretender = (playerId, nationIdentifier) => playerFileStore.isPlayerInGameControllingNation(playerId, _gameObject.getName(), nationIdentifier);
    _gameObject.claimNation = (playerId, nationFilename) => playerFileStore.addPlayerControlledNationInGame(playerId, nationFilename, _gameObject.getName());

    _gameObject.removePretender = (nameOfNation) =>
    {

    };

    _gameObject.substitutePlayer = (nameOfNation, idOfNewPlayer) =>
    {

    };

    _gameObject.fetchStatusDump = () => _gameObject.emitPromiseToServer("GET_STATUS_DUMP");

    _gameObject.startUpdating = (interval) => _intervalFunctionId = setInterval(_currentTimer.updateTimer, interval);
    _gameObject.stopUpdating = () => clearInterval(_intervalFunctionId);

    _gameObject.emitPromiseToServer = (message, additionalDataObjectToSend) =>
    {
        const server = _gameObject.getServer();
        const dataPackage = _createGameDataPackage();
        Object.assign(dataPackage, additionalDataObjectToSend);

        return server.emitPromise(message, dataPackage);
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

