"use strict";
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var ongoingGamesStore = require("../../games/ongoing_games_store.js");
var dom5SettingsData = require("../../json/dom5_settings.json");
var commandData = new CommandData("GET_SETTING_VALUE_ACROSS_GAMES");
module.exports = GetSettingValueAcrossGamesCommand;
function GetSettingValueAcrossGamesCommand() {
    var getSettingValueAcrossGamesCommand = new Command(commandData);
    getSettingValueAcrossGamesCommand.addBehaviour(_behaviour);
    getSettingValueAcrossGamesCommand.addRequirements(commandPermissions.assertMemberIsTrusted);
    return getSettingValueAcrossGamesCommand;
}
function _behaviour(commandContext) {
    var orderedvalueNamePairs;
    var arrayOfCommandArguments = commandContext.getCommandArgumentsArray();
    var settingKeyArgument = arrayOfCommandArguments[0];
    var introductionString = "Below is the list of values for the setting " + settingKeyArgument + ":\n\n";
    var listString = "";
    if (dom5SettingsData[settingKeyArgument] == null)
        return commandContext.respondToCommand("Invalid setting key.");
    orderedvalueNamePairs = getOrderedValueNamePairsArray(settingKeyArgument);
    orderedvalueNamePairs.forEach(function (valueNamePair) {
        listString += valueNamePair[0].toString().width(40) + "     in " + valueNamePair[1] + "\n";
    });
    return commandContext.respondToCommand(introductionString + listString.toBox());
}
function getOrderedValueNamePairsArray(settingKey) {
    var array = [];
    ongoingGamesStore.forEachGame(function (gameObject, nameKey) {
        var settingObject = gameObject.getSettingByKey(settingKeyArgument);
        array.push([settingObject.getValue(), gameObject.getName()]);
    });
    array.sort(function (obj1, obj2) { return obj1[0] < obj2[0]; });
    return array;
}
//# sourceMappingURL=get_setting_value_across_games.js.map