
const assert = require("../../asserter.js");

module.exports = Dominions5Nation;

function Dominions5Nation(eraNumber, nationData)
{
    assert.isIntegerOrThrow(eraNumber);
    assert.isObjectOrThrow(nationData);
    assert.isIntegerOrThrow(nationData.number);
    assert.isStringOrThrow(nationData.name);
    assert.isStringOrThrow(nationData.fullName);
    assert.isStringOrThrow(nationData.filename);

    const _nationEra = eraNumber;
    const _number = nationData.number;
    const _name = nationData.name;
    const _fullName = nationData.fullName;
    const _filename = nationData.filename;

    this.getNationEraAsNumber = () => _nationEra;
    this.getNationEraAsString = () =>
    {
        if (_nationEra === 1)
            return "ea";
        else if (_nationEra === 2)
            return "ma";
        else if (_nationEra === 3)
            return "la";
        else return "Unknown Era";
    };

    this.getNumber = () => _number;
    this.getName = () => _name;
    this.getFullName = () => _fullName;
    this.getFilename = () => _filename;
    this.getTurnFilename = () => _filename + ".trn";
    this.getTurnOrderFilename = () => _filename + ".2h";

    this.doesIdentifierMatchThisNation = (identifier) =>
    {
        var lowerCaseIdentifier = identifier.toString().toLowerCase();

        if (/\..+$/i.test(lowerCaseIdentifier) === true)
            lowerCaseIdentifier = lowerCaseIdentifier.replace(/\..+$/i, "");

        if (lowerCaseIdentifier == this.getNumber())
            return true;
        else if (lowerCaseIdentifier === this.getName().toLowerCase())
            return true;
        else if (lowerCaseIdentifier === this.getFullName().toLowerCase())
            return true;
        else if (lowerCaseIdentifier === this.getFilename().toLowerCase())
            return true;
        else return false;
    };

    this.isNationInEra = (era) =>
    {
        if (era == this.getNationEraAsNumber())
            return true;

        else if (era.toString().toLowerCase() == this.getNationEraAsString())
            return true;

        else return false;
    };
}