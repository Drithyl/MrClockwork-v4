
const config = require("../../config/config.json");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");
const dom5SettingFlags = require("../../json/dominions5_setting_flags.json");
const dom6SettingFlags = require("../../json/dominions6_setting_flags.json");

const commandData = new CommandData("GET_SCORES");

module.exports = GetScoresCommand;

function GetScoresCommand()
{
    const getScoresCommand = new Command(commandData);

    getScoresCommand.addBehaviour(_behaviour);

    getScoresCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertServerIsOnline,
        commandPermissions.assertGameHasStarted
    );

    return getScoresCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const gameType = gameObject.getType();
    const settings = gameObject.getSettingsObject();
    const scoregraphs = settings.getScoregraphsSetting();
    const scoregraphsValue = scoregraphs.getValue();
    const gameName = gameObject.getName();
    const messageString = `Attached is the scores file for ${gameName}.`;
    const settingsFlags = (gameType === config.dom5GameTypeName) ?
        dom5SettingFlags :
        dom6SettingFlags;

    if (+scoregraphsValue !== +settingsFlags.VISIBLE_SCOREGRAPHS)
        return commandContext.respondToCommand(new MessagePayload(`You can only receive the scores file when the scoregraphs setting for this game is on.`));
    
    return gameObject.emitPromiseWithGameDataToServer("GET_SCORE_DUMP")
    .then((scoresFile) => 
    {
        const payload = new MessagePayload(messageString);
        payload.setAttachment(`${gameName} Scores.html`, scoresFile);
        return commandContext.respondToCommand(payload);
    });
}