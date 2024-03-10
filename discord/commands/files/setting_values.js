const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");
const ongoingGamesStore = require("../../../games/ongoing_games_store.js");
const dom5SettingsData = require("../../../json/dom5_settings.json");
const dom6SettingsData = require("../../../json/dom6_settings.json");


const KEY_OPTION_NAME = "setting_key";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("setting_values")
		.setDescription("[Dev-only] Receive a list of the values of a setting currently in use in every Dominions game.")
        .addStringOption(option =>
            option.setName(KEY_OPTION_NAME)
            .setDescription("A game setting's key.")
            .setRequired(true)
        ),

	execute: behaviour,

    // This command will never be deployed globally; only to a private dev guild
    isDev: true
};


async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsDev(commandContext);

    let listString = "";
    let orderedvalueNamePairs;

    const settingKey = commandContext.options.getString(KEY_OPTION_NAME).toLowerCase();
    const introductionString = `Below is the list of values for the setting ${settingKey}:\n\n`;

    if (dom5SettingsData[settingKey] == null && dom6SettingsData[settingKey] == null)
        return commandContext.respondToCommand(new MessagePayload(`Invalid setting key.`));

    orderedvalueNamePairs = _getOrderedValueNamePairsArray(settingKey);

    orderedvalueNamePairs.forEach((valueNamePair) =>
    {
        listString += `${valueNamePair[0].toString().width(40)}     in ${valueNamePair[1]}\n`;
    });

    return commandContext.respondToCommand(
        new MessagePayload(introductionString, listString, true, "```")
    );
}

function _getOrderedValueNamePairsArray(settingKey)
{
    let array = [];

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
