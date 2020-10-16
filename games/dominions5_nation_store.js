
const dominions5NationData = require("../json/dom5_nations.json");
const Dominions5Nation = require("./prototypes/dominions5_nation.js");

const nationObjects = _generateNationObjects();

exports.getNation = (identifier) => 
{
    var nationObject;

    for (var i = 0; i < nationObjects.length; i++)
    {
        var nationObject = nationObjects[i];

        if (nationObject.doesIdentifierMatchThisNation(identifier) === true)
            return nationObject;
    }

    return null;
};

exports.getNationInEra = (identifier, era) => 
{
    var nationObject;

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

exports.getEaNations = () => nationObjects.filter((nationObject) => nationObject.getNationEraAsNumber === 1);
exports.getMaNations = () => nationObjects.filter((nationObject) => nationObject.getNationEraAsNumber === 2);
exports.getLaNations = () => nationObjects.filter((nationObject) => nationObject.getNationEraAsNumber === 3);

exports.isValidNationIdentifier = (identifier) => exports.getNation(identifier) != null;
exports.isValidNationIdentifierInEra = (identifier, era) => exports.getNationInEra(identifier, era) != null;

function _generateNationObjects()
{
    const nationObjectArray = [];

    for (var eraNumber in dominions5NationData)
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