
const assert = require("../../asserter.js");
const { SemanticError } = require("../../errors/custom_errors");
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
        if (dom5NationStore.isValidNationIdentifier(nationFilename) === false)
            throw new SemanticError(`Invalid nation identifier: ${nationFilename}.`);

        if (this.isControllingNation(nationFilename) === false)
            _controlledNations.push(dom5NationStore.getNation(nationFilename));
    };

    this.removeControlOfNation = (nationFilename) =>
    {
        const filenameWithoutExtension = dom5NationStore.trimFilenameExtension(nationFilename);
        
        for (var i = _controlledNations.length - 1; i >= 0; i--)
            if (_controlledNations[i].getFilename() == filenameWithoutExtension)
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
        return _controlledNations.find((nation) => nation.getFilename() === filenameWithoutExtension) != null;
    };

    this.getNationsControlledByPlayer = () => 
    {
        return [..._controlledNations];
    };

    this.toJSON = () =>
    {
        const nationFilenames = [];

        _controlledNations.forEach((nation) => nationFilenames.push(nation.getFilename()));

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