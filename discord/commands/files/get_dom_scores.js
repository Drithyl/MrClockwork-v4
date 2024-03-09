
const asserter = require("../../../asserter.js");
const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const dom5SettingFlags = require("../../../json/dominions5_setting_flags.json");
const dom6SettingFlags = require("../../../json/dominions6_setting_flags.json");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("scores")
		.setDescription("Get current turn's scores file. Only available if visible scoregraphs, or games which have ended."),

	execute: behaviour
};

async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsTrusted(commandContext);
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);
    await commandPermissions.assertServerIsOnline(commandContext);
    await commandPermissions.assertGameHasStarted(commandContext);

    const gameObject = commandContext.targetedGame;
    const gameType = gameObject.getType();
    const settings = gameObject.getSettingsObject();
    const scoregraphs = settings.getScoregraphsSetting();
    const scoregraphsValue = scoregraphs.getValue();
    const gameName = gameObject.getName();
    const messageString = `Attached is the scores file for ${gameName}.`;
    const settingsFlags = (asserter.isDom5GameType(gameType) === true) ?
        dom5SettingFlags :
        dom6SettingFlags;

    if (+scoregraphsValue !== +settingsFlags.VISIBLE_SCOREGRAPHS)
        return commandContext.respondToCommand(new MessagePayload(`You can only receive the scores file when the scoregraphs setting for this game is on.`));
    
    const scoresFile = await gameObject.emitPromiseWithGameDataToServer("GET_SCORE_DUMP");
    const payload = new MessagePayload(messageString);
    payload.setAttachment(`${gameName} Scores.html`, scoresFile);
    
    return commandContext.respondToCommand(payload);
}