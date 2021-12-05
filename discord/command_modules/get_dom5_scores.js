
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");
const dom5SettingFlags = require("../../json/dominions5_setting_flags.json");

const commandData = new CommandData("GET_DOM5_SCORES");

module.exports = GetDom5ScoresCommand;

function GetDom5ScoresCommand()
{
    const getDom5ScoresCommand = new Command(commandData);

    getDom5ScoresCommand.addBehaviour(_behaviour);

    getDom5ScoresCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertServerIsOnline,
        commandPermissions.assertGameHasStarted
    );

    return getDom5ScoresCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const settings = gameObject.getSettingsObject();
    const scoregraphs = settings.getScoregraphsSetting();
    const scoregraphsValue = scoregraphs.getValue();
    const gameName = gameObject.getName();
    const messageString = `Attached is the scores file for ${gameName}.`;

    if (+scoregraphsValue !== +dom5SettingFlags.VISIBLE_SCOREGRAPHS)
        return commandContext.respondToCommand(new MessagePayload(`You can only receive the scores file when the scoregraphs setting for this game is on.`));
    
    return gameObject.emitPromiseWithGameDataToServer("GET_SCORE_DUMP")
    .then((scoresFile) => 
    {
        const payload = new MessagePayload(messageString);
        payload.setAttachment(`${gameName} Scores.html`, scoresFile);
        return commandContext.respondToCommand(payload);
    });
}