
const dominions5NationData = require("../json/dom5_nations.json");
const Dominions5Nation = require("./prototypes/dominions5_nation.js");

const nationObjects = _generateNationObjects();

exports.getNation = (identifier) => 
{
    let nationObject;

    for (let i = 0; i < nationObjects.length; i++)
    {
        let nationObject = nationObjects[i];

        if (nationObject.doesIdentifierMatchThisNation(identifier) === true)
            return nationObject;
    }

    return null;
};

exports.getNationInEra = (identifier, era) => 
{
    let nationObject;

    for (let i = 0; i < nationObjects.length; i++)
    {
        let nationObject = nationObjects[i];
        
        if (nationObject.doesIdentifierMatchThisNation(identifier) === true)
        {
            if (nationObject.isNationInEra(era) === true)
                return nationObject;
        }
    }

    return null;
};

exports.getEaNations = () => nationObjects.filter((nationObject) => nationObject.getNationEraAsNumber === 1);
exports.getMaNations = () => nationObjects.filter((nationObject) => nationObject.getNationEraAsNumber === 2);
exports.getLaNations = () => nationObjects.filter((nationObject) => nationObject.getNationEraAsNumber === 3);

exports.isValidNationIdentifier = (identifier) => exports.getNation(identifier) != null;
exports.isValidNationIdentifierInEra = (identifier, era) => exports.getNationInEra(identifier, era) != null;

exports.trimFilenameExtension = (nationIdentifier) => 
{
    if (typeof nationIdentifier !== "string")
        return nationIdentifier;

    return nationIdentifier.replace(/\..+$/i, "");
};

function _generateNationObjects()
{
    const nationObjectArray = [];

    for (let eraNumber in dominions5NationData)
    {
        let nationDataArray = dominions5NationData[eraNumber];

        nationDataArray.forEach((nationData) => 
        {
            let nationObject = new Dominions5Nation(+eraNumber, nationData);
            nationObjectArray.push(nationObject);
        });
    }

    return nationObjectArray;
}