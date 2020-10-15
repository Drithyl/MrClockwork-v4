"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var dom5NationsByEraNumber = require("../../json/dom5_nations.json");
var commandData = new CommandData("GET_DOM5_NATIONS");
module.exports = GetDom5NationsCommand;
function GetDom5NationsCommand() {
    var getDom5NationsCommand = new Command(commandData);
    getDom5NationsCommand.addBehaviour(_behaviour);
    return getDom5NationsCommand;
}
function _behaviour(commandContext) {
    var introductionString = "Below is the list of nation numbers, names and filenames for your convenience:\n\n";
    var nationListString = formatNationListString();
    return commandContext.respondToCommand(introductionString + nationListString.toBox(), { prepend: "```", append: "```" });
}
function formatNationListString() {
    var stringList = "";
    for (var eraNumber in dom5NationsByEraNumber) {
        var arrayOfNationsInEra = dom5NationsByEraNumber[eraNumber];
        var eraName = translateEraNumberToName(eraNumber);
        stringList += "\n\n- " + eraName + " NATIONS:\n\n";
        arrayOfNationsInEra.forEach(function (nationData) {
            stringList += nationData.number.toString().width(4) + " " + nationData.name.width(12) + " " + nationData.filename + "\n";
        });
    }
    return stringList;
}
function translateEraNumberToName(eraNumber) {
    if (eraNumber === "1")
        return "EARLY AGE";
    else if (eraNumber === "2")
        return "MIDDLE AGE";
    else if (eraNumber === "3")
        return "LATE AGE";
    else
        return eraNumber;
}
//# sourceMappingURL=get_dom5_nations.js.map