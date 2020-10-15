"use strict";
var assert = require("../../asserter.js");
module.exports = Dominions5Nation;
function Dominions5Nation(eraNumber, nationData) {
    var _this = this;
    assert.isIntegerOrThrow(eraNumber);
    assert.isObjectOrThrow(nationData);
    assert.isIntegerOrThrow(nationData.number);
    assert.isStringOrThrow(nationData.name);
    assert.isStringOrThrow(nationData.fullName);
    assert.isStringOrThrow(nationData.filename);
    var _nationEra = eraNumber;
    var _number = nationData.number;
    var _name = nationData.name;
    var _fullName = nationData.fullName;
    var _filename = nationData.filename;
    this.getNationEraAsNumber = function () { return _nationEra; };
    this.getNationEraAsString = function () {
        if (_nationEra === 1)
            return "ea";
        else if (_nationEra === 2)
            return "ma";
        else if (_nationEra === 3)
            return "la";
        else
            return "Unknown Era";
    };
    this.getNumber = function () { return _number; };
    this.getName = function () { return _name; };
    this.getFullName = function () { return _fullName; };
    this.getFilename = function () { return _filename; };
    this.getTurnFilename = function () { return _filename + ".trn"; };
    this.getTurnOrderFilename = function () { return _filename + ".2h"; };
    this.doesIdentifierMatchThisNation = function (identifier) {
        var lowerCaseIdentifier = identifier.toString().toLowerCase();
        if (lowerCaseIdentifier == _this.getNumber())
            return true;
        else if (lowerCaseIdentifier === _this.getName().toLowerCase())
            return true;
        else if (lowerCaseIdentifier === _this.getFullName().toLowerCase())
            return true;
        else if (lowerCaseIdentifier === _this.getFilename().toLowerCase())
            return true;
        else
            return false;
    };
    this.isNationInEra = function (era) {
        if (era == _this.getNationEraAsNumber())
            return true;
        else if (era.toString.toLowerCase() == _this.getNationEraAsString())
            return true;
        else
            return false;
    };
}
//# sourceMappingURL=dominions5_nation.js.map