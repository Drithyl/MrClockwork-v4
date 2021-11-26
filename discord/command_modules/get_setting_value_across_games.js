
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const ongoingGamesStore = require("../../games/ongoing_games_store.js");
const dom5SettingsData = require("../../json/dom5_settings.json");
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
    const introductionString = `Below is the list of values for the setting ${settingKeyArgument}:\n\n`;

    if (dom5SettingsData[settingKeyArgument] == null)
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