
const assert = require("../../asserter.js");
const DominionsPreferences = require("./dominions_preferences.js");
const dominions5NationStore = require("../../games/dominions5_nation_store.js");

module.exports = PlayerGameData;

function PlayerGameData(playerId, gameName)
{
    assert.isStringOrThrow(playerId);
    assert.isStringOrThrow(gameName);

    const _playerId = playerId;
    const _gameName = gameName;
    const _controlledNationIdentifiers = [];
    var _dominionsPreferences = new DominionsPreferences(playerId, gameName);

    this.getPlayerId = () => _playerId;
    this.getGameName = () => _gameName;

    this.addControlledNation = (nationIdentifier) =>
    {
        if (dominions5NationStore.isValidNationIdentifier(nationIdentifier) === false)
            throw new SemanticError(`Invalid nation identifier at index ${i}.`);

        _controlledNationIdentifiers.push(nationIdentifier);
    };

    this.removePlayerControlOfNation = (nationIdentifier) =>
    {
        for (var i = _controlledNationIdentifiers.length - 1; i >= 0; i--)
            if (_controlledNationIdentifiers[i] == nationIdentifier)
                _controlledNationIdentifiers.splice(i, 1);
    };

    this.isNationControlledByPlayer = (nationIdentifier) => 
    {
        const identifier = nationIdentifier.toString().toLowerCase();
        return _controlledNationFilenames.includes(identifier);
    };

    this.getDominionsPreferences = () => _dominionsPreferences;
    this.setDominionsPreferences = (dominionsPreferences) =>
    {
        assert.isInstanceOfPrototypeOrThrow(dominionsPreferences, DominionsPreferences);
        _dominionsPreferences = dominionsPreferences;
    };

    this.toJSON = () =>
    {
        return {
            playerId: _playerId,
            gameName: _gameName,
            preferences: _dominionsPreferences.toJSON(),
            controlledNations: _controlledNationIdentifiers
        };
    };
}

PlayerGameData.loadFromJSON = (jsonData) =>
{
    const gameData = new PlayerGameData(jsonData.playerId, jsonData.gameName);
    const dominionsPreferences = DominionsPreferences.loadFromJSON(jsonData.preferences);

    gameData.setDominionsPreferences(dominionsPreferences);
    jsonData.controlledNations.forEach((nationIdentifier) => gameData.addControlledNation(nationIdentifier));

    return gameData;
};