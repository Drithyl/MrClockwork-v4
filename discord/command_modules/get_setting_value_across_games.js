
const asserter = require("../../asserter.js");
const config = require("../../config/config.json");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const ongoingGamesStore = require("../../games/ongoing_games_store.js");
const dom5SettingsData = require("../../json/dom5_settings.json");
const dom6SettingsData = require("../../json/dom6_settings.json");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("GET_SETTING_VALUE_ACROSS_GAMES");

module.exports = GetSettingValueAcrossGamesCommand;

function GetSettingValueAcrossGamesCommand()
{
    const getSettingValueAcrossGamesCommand = new Command(commandData);

    getSettingValueAcrossGamesCommand.addBehaviour(_behaviour);

    getSettingValueAcrossGamesCommand.addRequirements(
        commandPermissions.assertMemberIsDev
    );

    return getSettingValueAcrossGamesCommand;
}

function _behaviour(commandContext)
{
    var listString = "";
    var orderedvalueNamePairs;

    const arrayOfCommandArguments = commandContext.getCommandArgumentsArray();
    const settingKeyArgument = arrayOfCommandArguments[0].toLowerCase();
    const gameType = arrayOfCommandArguments[1];
    const introductionString = `Below is the list of values for the setting ${settingKeyArgument}:\n\n`;
    const settingsData = (gameType === config.dom5GameTypeName) ?
        dom5SettingsData :
        dom6SettingsData;

    if (asserter.isValidGameType(gameType) === false)
        return commandContext.respondToCommand(new MessagePayload(`You must specify the game for which you want to get a list of nations. Either ${config.dom5GameTypeName} or ${config.dom6GameTypeName}`));

    if (settingsData[settingKeyArgument] == null)
        return commandContext.respondToCommand(new MessagePayload(`Invalid setting key.`));

    orderedvalueNamePairs = _getOrderedValueNamePairsArray(settingKeyArgument);

    orderedvalueNamePairs.forEach((valueNamePair) =>
    {
        listString += `${valueNamePair[0].toString().width(40)}     in ${valueNamePair[1]}\n`;
    });

    return commandContext.respondToCommand(new MessagePayload(introductionString, listString, true, "```"));
}

function _getOrderedValueNamePairsArray(settingKey)
{
    var array = [];

    ongoingGamesStore.forEachGame((gameObject, gameName) =>
    {
        const settingsObject = gameObject.getSettingsObject();
        const setting = settingsObject.getSettingByKey(settingKey);

        if (setting != null)
            array.push([setting.getValue(), gameName]);
    });

    array.sort((obj1, obj2) => obj1[0] < obj2[0]);
    return array;
}