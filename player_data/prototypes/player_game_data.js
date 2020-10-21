
const assert = require("../../asserter.js");
const DominionsPreferences = require("./dominions_preferences.js");
const dom5NationStore = require("../../games/dominions5_nation_store.js");
const dominions5NationStore = require("../../games/dominions5_nation_store.js");

module.exports = PlayerGameData;

function PlayerGameData(playerId, gameName)
{
    assert.isStringOrThrow(playerId);
    assert.isStringOrThrow(gameName);

    const _playerId = playerId;
    const _gameName = gameName;
    const _controlledNations = [];
    var _dominionsPreferences = new DominionsPreferences(playerId, gameName);

    this.getPlayerId = () => _playerId;
    this.getGameName = () => _gameName;

    this.addControlledNation = (nationFilename) =>
    {
        if (dominions5NationStore.isValidNationIdentifier(nationFilename) === false)
            throw new SemanticError(`Invalid nation identifier at index ${i}.`);

        _controlledNations.push(dom5NationStore.getNation(nationFilename));
    };

    this.removePlayerControlOfNation = (nationFilename) =>
    {
        for (var i = _controlledNations.length - 1; i >= 0; i--)
            if (_controlledNations[i].getTurnFilename() == nationFilename)
                _controlledNations.splice(i, 1);
    };

    this.isNationControlledByPlayer = (nationFilename) => 
    {
        return _controlledNations.find((nation) => nation.getTurnFilename() === nationFilename) != null;
    };

    this.getNationsControlledByPlayer = () => 
    {
        return [..._controlledNations];
    };

    this.getDominionsPreferences = () => _dominionsPreferences;
    this.setDominionsPreferences = (dominionsPreferences) =>
    {
        assert.isInstanceOfPrototypeOrThrow(dominionsPreferences, DominionsPreferences);
        _dominionsPreferences = dominionsPreferences;
    };

    this.toJSON = () =>
    {
        const nationFilenames = [];

        _controlledNations.forEach((nation) => nationFilenames.push(nation.getTurnFilename()));

        return {
            playerId: _playerId,
            gameName: _gameName,
            preferences: _dominionsPreferences.toJSON(),
            controlledNations: nationFilenames
        };
    };
}

PlayerGameData.loadFromJSON = (jsonData) =>
{
    const gameData = new PlayerGameData(jsonData.playerId, jsonData.gameName);
    const dominionsPreferences = DominionsPreferences.loadFromJSON(jsonData.preferences);

    gameData.setDominionsPreferences(dominionsPreferences);
    jsonData.controlledNations.forEach((nationFilename) => 
    {
        const nationObject = dom5NationStore.getNation(nationFilename);
        gameData.addControlledNation(nationObject);
    });

    return gameData;
};