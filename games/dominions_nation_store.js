
const config = require("../config/config.json");
const dominions5NationData = require("../json/dom5_nations.json");
const dominions6NationData = require("../json/dom6_nations.json");
const DominionsNation = require("./prototypes/dominions_nation.js");

const dom5NationObjects = _generateNationObjects(dominions5NationData);
const dom6NationObjects = _generateNationObjects(dominions6NationData);

exports.getNation = (identifier, gameType) => 
{
    const nationObjects = _getNationObjects(gameType);
    
    for (var i = 0; i < nationObjects.length; i++)
    {
        var nationObject = nationObjects[i];

        if (nationObject.doesIdentifierMatchThisNation(identifier) === true)
            return nationObject;
    }

    return null;
};

exports.getNationInEra = (identifier, era, gameType) => 
{
    const nationObjects = _getNationObjects(gameType);
    
    for (var i = 0; i < nationObjects.length; i++)
    {
        var nationObject = nationObjects[i];
        
        if (nationObject.doesIdentifierMatchThisNation(identifier) === true)
        {
            if (nationObject.isNationInEra(era) === true)
                return nationObject;
        }
    }

    return null;
};

exports.getEaNations = (gameType) => _getNationObjects(gameType).filter((nationObject) => nationObject.getNationEraAsNumber === 1);
exports.getMaNations = (gameType) => _getNationObjects(gameType).filter((nationObject) => nationObject.getNationEraAsNumber === 2);
exports.getLaNations = (gameType) => _getNationObjects(gameType).filter((nationObject) => nationObject.getNationEraAsNumber === 3);

exports.isValidNationIdentifier = (identifier, gameType) => exports.getNation(identifier, gameType) != null;
exports.isValidNationIdentifierInEra = (identifier, era, gameType) => exports.getNationInEra(identifier, era, gameType) != null;

exports.trimFilenameExtension = (nationIdentifier) => 
{
    if (typeof nationIdentifier !== "string")
        return nationIdentifier;

    return nationIdentifier.replace(/\..+$/i, "");
};

function _generateNationObjects(nationData)
{
    const nationObjectArray = [];

    for (var eraNumber in nationData)
    {
        let nationDataArray = nationData[eraNumber];

        nationDataArray.forEach((nationData) => 
        {
            let nationObject = new DominionsNation(+eraNumber, nationData);
            nationObjectArray.push(nationObject);
        });
    }

    return nationObjectArray;
}

function _getNationObjects(gameType) {
    if (gameType === config.dom5GameTypeName)
        return dom5NationObjects;

    return dom6NationObjects;
}