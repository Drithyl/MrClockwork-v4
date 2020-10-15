
const assert = require("../../asserter.js");
const dominions5NationStore = require("../../games/dominions5_nation_store.js");

export { loadAll, revivePlayerGameDataFromJSON, PlayerGameData };

function loadAll()
{
    var revivedData = [];
    var dirPath = config.pathToPlayerGameData;
    var subfolderNames = rw.getDirSubfolderNamesSync(dirPath);

    subfolderNames.forEach((subfolderName) =>
    {
        var subfolderContents = rw.readDirContentsSync(`${dirPath}/${subfolderName}`);

        subfolderContents.forEach((stringData) =>
        {
            var parsedJSON = JSON.parse(stringData);
            var revivedPlayerGameDataObject = revivePlayerGameDataFromJSON(parsedJSON);
            revivedData.push(revivedPlayerGameDataObject);
        });
    });

    return revivedData;
}

function revivePlayerGameDataFromJSON(jsonData)
{
    assert.isObjectOrThrow(jsonData);

    var gameData = new PlayerGameData(jsonData.playerId, jsonData.gameName, jsonData.controlledNations);

    return gameData;
}

function PlayerGameData(playerId, gameName, arrayOfControlledNationIdentifiers)
{
    assert.isStringOrThrow(playerId);
    assert.isStringOrThrow(gameName);
    _assertListOfControlledNations(arrayOfControlledNationIdentifiers);

    const _playerId = playerId;
    const _gameName = gameName;
    const _controlledNationIdentifiers = arrayOfControlledNationIdentifiers;

    this.getPlayerId = () => _playerId;
    this.getGameName = () => _gameName;

    this.doesPlayerControlNation = (nationIdentifier) => 
    {
        const identifier = nationIdentifier.toString().toLowerCase();
        return _controlledNationFilenames.includes(identifier);
    };

    this.addControlledNation = (nationIdentifier) =>
    {
        _assertNationIdentifier(nationIdentifier);
        _controlledNationIdentifiers.push(nationIdentifier);
    };

    this.removePlayerControlOfNation = (nationIdentifier) =>
    {
        for (var i = _controlledNationIdentifiers.length - 1; i >= 0; i--)
            if (_controlledNationIdentifiers[i] == nationIdentifier)
                _controlledNationIdentifiers.splice(i, 1);
    };

    this.save = () =>
    {
        var path = `${config.pathToPlayerGameData}/${_gameName}/${_playerId}.json`;
        var dataToSave = _convertToJSON();

        return rw.saveJSON(path, dataToSave)
        .catch((err) => 
        {
            rw.log("error", `Could not save ${_gameName}'s player ${_playerId} data: ${err.message}`);
            return Promise.resolve();
        });
    };

    function _convertToJSON()
    {
        return {
            playerId: _playerId,
            gameName: _gameName,
            controlledNations: _controlledNationIdentifiers
        };
    }
}

function _assertListOfControlledNations(controlledNations)
{
    assert.isArrayOrThrow(controlledNations);

    for (var i = 0; i < controlledNations.length; i++)
    {
        var nationIdentifier = controlledNations[i];
        _assertNationIdentifier(nationIdentifier);
    }
}

function _assertNationIdentifier(nationIdentifier)
{
    if (dominions5NationStore.isValidNationIdentifier(nationIdentifier) === false)
        throw new SemanticError(`Invalid nation identifier at index ${i}.`);
}