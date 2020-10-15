"use strict";
var dominions5NationData = require("../json/dom5_nations.json");
var Dominions5Nation = require("./prototypes/dominions5_nation.js");
var nationObjects = _generateNationObjects();
exports.getNation = function (identifier) {
    var nationObject;
    for (var i = 0; i < nationObjects.length; i++) {
        var nationObject = nationObjects[i];
        if (nationObject.doesIdentifierMatchThisNation(identifier) === true)
            return nationObject;
    }
    return null;
};
exports.getNationInEra = function (identifier, era) {
    var nationObject;
    for (var i = 0; i < nationObjects.length; i++) {
        var nationObject = nationObjects[i];
        if (nationObject.doesIdentifierMatchThisNation(identifier) === true) {
            if (nationObject.isNationInEra(era) === true)
                return nationObject;
        }
    }
    return null;
};
exports.getEaNations = function () { return nationObjects.filter(function (nationObject) { return nationObject.getNationEraAsNumber === 1; }); };
exports.getMaNations = function () { return nationObjects.filter(function (nationObject) { return nationObject.getNationEraAsNumber === 2; }); };
exports.getLaNations = function () { return nationObjects.filter(function (nationObject) { return nationObject.getNationEraAsNumber === 3; }); };
exports.isValidNationIdentifier = function (identifier) { return exports.getNation(identifier) != null; };
exports.isValidNationIdentifierInEra = function (identifier, era) { return exports.getNationInEra(identifier, era) != null; };
function _generateNationObjects() {
    var nationObjectArray = [];
    for (var eraNumber in dominions5NationData) {
        var nationDataArray = dominions5NationData[eraNumber];
        nationDataArray.forEach(function (nationData) {
            var nationObject = new Dominions5Nation(+eraNumber, nationData);
            nationObjectArray.push(nationObject);
        });
    }
    return nationObjectArray;
}
//# sourceMappingURL=dominions5_nation_store.js.map