
const assert = require("../../asserter.js");
const gamesStore = require("../../games/ongoing_games_store.js");
const dom5NationStore = require("../../games/dominions5_nation_store.js");

module.exports = PlayerGameData;

function PlayerGameData(playerId, gameName)
{
    assert.isStringOrThrow(playerId);
    assert.isStringOrThrow(gameName);

    const _playerId = playerId;
    const _gameName = gameName;
    const _controlledNations = [];

    this.getPlayerId = () => _playerId;
    this.getGameName = () => _gameName;

    this.addControlledNation = (nationFilename) =>
    {
        assert.isStringOrThrow(nationFilename);

        if (this.isControllingNation(nationFilename) === false)
            _controlledNations.push(nationFilename);
    };

    this.removeControlOfNation = (nationFilename) =>
    {
        const filenameWithoutExtension = dom5NationStore.trimFilenameExtension(nationFilename);
        
        for (var i = _controlledNations.length - 1; i >= 0; i--)
            if (_controlledNations[i] == filenameWithoutExtension)
                _controlledNations.splice(i, 1);
    };

    this.removeControlOfAllNations = () =>
    {
        while(_controlledNations.length > 0)
            _controlledNations.shift();
    };

    this.isControllingNation = (nationFilename) => 
    {
        const filenameWithoutExtension = dom5NationStore.trimFilenameExtension(nationFilename);
        return _controlledNations.find((nation) => nation === filenameWithoutExtension) != null;
    };

    this.isPlayerStillActive = () => 
    {
        const game = gamesStore.getOngoingGameByName(_gameName);
        const status = game.getLastKnownStatus();
        const nations = status.getPlayers();

        if (nations == null)
            return false;

        return nations.some((nation) =>
        {
            if (_controlledNations.includes(nation.filename) === false)
                return false;

            if (nation.isHuman === true)
                return true;

            return false;
        });
    };

    this.getNationFilenamesControlledByPlayer = () => 
    {
        return [..._controlledNations];
    };

    this.toJSON = () =>
    {
        const nationFilenames = [];

        _controlledNations.forEach((nation) => nationFilenames.push(nation));

        return {
            playerId: _playerId,
            gameName: _gameName,
            controlledNations: nationFilenames
        };
    };
}

PlayerGameData.loadFromJSON = (jsonData) =>
{
    const gameData = new PlayerGameData(jsonData.playerId, jsonData.gameName);

    jsonData.controlledNations.forEach((nationFilename) => 
    {
        gameData.addControlledNation(nationFilename);
    });

    return gameData;
};