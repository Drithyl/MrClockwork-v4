
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const ongoingGamesStore = require("../../games/ongoing_games_store.js");
const dom5SettingsData = require("../../json/dom5_settings.json");

const commandData = new CommandData("GET_SETTING_VALUE_ACROSS_GAMES");

module.exports = GetSettingValueAcrossGamesCommand;

function GetSettingValueAcrossGamesCommand()
{
    const getSettingValueAcrossGamesCommand = new Command(commandData);

    getSettingValueAcrossGamesCommand.addBehaviour(_behaviour);

    getSettingValueAcrossGamesCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted
    );

    return getSettingValueAcrossGamesCommand;
}

function _behaviour(commandContext)
{
    var orderedvalueNamePairs;
    var arrayOfCommandArguments = commandContext.getCommandArgumentsArray();
    var settingKeyArgument = arrayOfCommandArguments[0];
    var introductionString = `Below is the list of values for the setting ${settingKeyArgument}:\n\n`;
    var listString = "";

    if (dom5SettingsData[settingKeyArgument] == null)
        return commandContext.respondToCommand(`Invalid setting key.`);

    orderedvalueNamePairs = getOrderedValueNamePairsArray(settingKeyArgument);

    orderedvalueNamePairs.forEach((valueNamePair) =>
    {
        listString += `${valueNamePair[0].toString().width(40)}     in ${valueNamePair[1]}\n`;
    });

    return commandContext.respondToCommand(introductionString + listString.toBox());
}

function getOrderedValueNamePairsArray(settingKey)
{
    var array = [];

    ongoingGamesStore.forEachGame((gameObject, nameKey) =>
    {
        var settingObject = gameObject.getSettingByKey(settingKeyArgument);
        array.push([settingObject.getValue(), gameObject.getName()]);
    });

    array.sort((obj1, obj2) => obj1[0] < obj2[0]);
    return array;
}