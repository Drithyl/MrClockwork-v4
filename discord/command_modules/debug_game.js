
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const ongoingGamesStore = require("../../games/ongoing_games_store.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("DEBUG_GAME");

module.exports = DebugGameCommand;

function DebugGameCommand()
{
    const debugGameCommand = new Command(commandData);

    debugGameCommand.addBehaviour(_behaviour);

    debugGameCommand.addRequirements(
        commandPermissions.assertMemberIsDev
    );

    return debugGameCommand;
}

async function _behaviour(commandContext)
{
    const commandArgumentsArray = commandContext.getCommandArgumentsArray();
    const nameOfGameToRepair = commandArgumentsArray[0];
    const payload = new MessagePayload("Below is the game's state:");
    var game;
    var status;
    var nations;
    var debugInfo;
    

    if (ongoingGamesStore.hasOngoingGameByName(nameOfGameToRepair) === false)
        return commandContext.respondToCommand(new MessagePayload(`No game found with this name.`));

    game = ongoingGamesStore.getOngoingGameByName(nameOfGameToRepair);
    status = game.getLastKnownStatus();
    nations = await game.fetchSubmittedNations();

    debugInfo = {
        guild: `${game.getGuild()?.getName()} (${game.getGuildId()})`,
        organizer: `${game.getOrganizer()?.getNameInGuild()} (${game.getOrganizerId()})`,
        channel: `${game.getChannel()?.name} (${game.getChannelId()})`,
        role: `${game.getRole()?.name} (${game.getRoleId()})`,
        server: game.getServer()?.getName(),
        address: `${game.getIp()}:${game.getPort()}`,
        statusEmbed: game.getStatusEmbedId(),
        status: {
            isServerOnline: game.isServerOnline(),
            isOnline: status.isOnline(),
            isEnforcingTimer: game.isEnforcingTimer(),
            hasStarted: status.hasStarted(),
            isCurrentTurnRollback: status.isCurrentTurnRollback(),
            isTurnProcessing: status.isTurnProcessing(),
            areAllTurnsDone: status.areAllTurnsDone(),
            isPaused: status.isPaused(),
            turnNumber: status.getTurnNumber(),
            msLeft: status.getMsLeft(),
            successfulCheckTimestamp: status.getSuccessfulCheckTimestamp(),
            lastUpdateTimestamp: status.getLastUpdateTimestamp(),
            lastTurnTimestamp: status.getLastTurnTimestamp(),
            players: status.getPlayers()
        },
        
        settings: game.getSettingsObject(),
        nations
    };



    payload.setAttachment("state.json", Buffer.from(JSON.stringify(debugInfo, null, 2)));


    return commandContext.respondByDm(new MessagePayload(`Getting info...`))
    .then(() => commandContext.respondByDm(payload));
    //.then(() => commandContext.respondByDm(new MessagePayload(`\`\`\`JSON\n${JSON.stringify(debugInfo, null, 2)}\`\`\``, "", true, "```JSON\n")));
}