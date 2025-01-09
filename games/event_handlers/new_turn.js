
const log = require("../../logger.js");
const assert = require("../../asserter.js");
const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { SEASONS } = require("../../constants/dominions-constants.js");
const dom5SettingFlags = require("../../json/dominions5_setting_flags.json");
const dom6SettingFlags = require("../../json/dominions6_setting_flags.json");
const MessagePayload = require("../../discord/prototypes/message_payload.js");
const { unixTimestampToDynamicDisplay, dateToUnixTimestamp } = require("../../utilities/formatting-utilities.js");


module.exports = (game, domEvents) =>
{
    const gameName = game.getName();
    const status = game.getLastKnownStatus();
    const timeLeft = status.getTimeLeft();
    const dateWhenTurnWillRoll = timeLeft.toDateObject();
    const unixTimestamp = dateToUnixTimestamp(dateWhenTurnWillRoll);
    const turnNumber = domEvents.getTurnNumber();

    // Starting season at turn 1 is Midspring.
    const turnSeason = SEASONS[(turnNumber-1) % SEASONS.length];

    // Year starts at 0, and turn 11 is year 1. Every 12 turns thereafter is a new year, i.e. turn 23 is year 2
    const turnYear = Math.floor((turnNumber + 1) / 12);
    
    try
    {
        // Update the game's status to reflect the new turn
        status.setHasStarted(true);
        status.setLastTurnTimestamp(Date.now());
        status.setMsToDefaultTimer(game);
        status.setIsTurnProcessing(false);
        status.setIsCurrentTurnRollback(false);

        // Announce the new turn in the game's channel
        game.sendGameAnnouncement(
            new MessagePayload()
            .addEmbeds(
                new EmbedBuilder()
                    .setColor(turnSeason.colour)
                    .setAuthor({ name: `TURN ${turnNumber} - YEAR ${turnYear}, ${turnSeason.name.toUpperCase()}`, iconURL: `${config.fullSecureUrl}/img/${turnSeason.icon}` })
                    .setDescription(`Next Turn:\n\n${unixTimestampToDynamicDisplay(unixTimestamp)},\nin ${timeLeft.printTimeLeft()}.`)
            )
        );

        // Process players' preferences on new turns
        _processNewTurnPreferences(game);

        // Log the new turn
        log.general(log.getNormalLevel(), `${gameName}\t_isCurrentRollback set to ${status.isCurrentTurnRollback()}`);
        log.general(log.getLeanLevel(), `${gameName}\tnew turn ${turnNumber}.`);
        log.general(log.getLeanLevel(), `${gameName} new timer set to ${status.getMsLeft()}ms.`);
    }

    catch(err)
    {
        // Log the error
        log.error(log.getLeanLevel(), `${gameName} new turn event error`, err.stack);

        // Attempt to inform players of the new turn error
        game.sendGameAnnouncement(
            `The following error occurred when resolving the game's new turn event:\n\n\`\`\`${err.message}\`\`\``
        );
    }
};



async function _processNewTurnPreferences(game)
{
    let fetchedTurnFiles;

    // Nation filenames and playerfiles that need backups will be stored here
    const nationFilesToFetch = [];
    const playerFilesRequestingBackups = [];

    // Fill up the arrays above with the game's player preferences
    _addPreferenceRequests(game, nationFilesToFetch, playerFilesRequestingBackups);
    

    // If there are no requests, skip the rest
    if (playerFilesRequestingBackups.length <= 0)
        return;


    // Fetch the turn/score files for all our requests
    fetchedTurnFiles = await game.emitPromiseWithGameDataToServer("GET_TURN_FILES", { nationNames: nationFilesToFetch });

    // Send our files to the players
    _sendNewTurnFiles(game, playerFilesRequestingBackups, fetchedTurnFiles);
}


// Fill up the two arrays passed in the parameters with the nation filenames and player files
function _addPreferenceRequests(game, nationFilenamesToFetch, playerFilesRequestingBackups)
{
    const playerFiles = game.getPlayerFiles();
    
    playerFiles.forEach((playerFile) => 
    {
        const preferences = playerFile.getEffectiveGamePreferences(game.getName());
        
        if (preferences.isReceivingBackups() === true)
        {
            const controlledNations = playerFile.getControlledNationFilenamesInGame(game.getName());

            nationFilenamesToFetch.push( ...controlledNations );
            playerFilesRequestingBackups.push(playerFile);
        }
    });
}

function _sendNewTurnFiles(game, playerFiles, fetchedTurnFiles)
{
    playerFiles.forEach((playerFile) =>
    {
        const gameData = playerFile.getGameData(game.getName());

        if (gameData.isPlayerStillActive() === true)
            _sendFilesToUser(game, playerFile, fetchedTurnFiles);

        else console.log(`Player no longer controls a human nation in game; skipping`);
    });
}

// Build and send the files to the user that owns this player file
async function _sendFilesToUser(game, playerFile, fetchedTurnFiles)
{
    const guild = game.getGuild();
    
    let payload;
    let memberWrapper;

    try
    {
        memberWrapper = await guild.fetchGuildMemberWrapperById(playerFile.getId());
        payload = _buildMessagePayload(game, playerFile, fetchedTurnFiles);
        memberWrapper.sendMessage(payload);
    }

    catch(err)
    {
        log.error(log.getNormalLevel(), `Error sending new turn files to player ${playerFile.getId()}`, err);
    }
}

// Build the payload that will be sent to this user, including their
// respective nation turn files and the score files if needed
function _buildMessagePayload(game, playerFile, fetchedTurnFiles)
{
    const gameType = game.getType();
    const status = game.getLastKnownStatus();
    const turnNumber = status.getTurnNumber();
    const settingFlags = (assert.isDom6GameType(gameType) === true) ?
        dom6SettingFlags :
        dom5SettingFlags;

    const settings = game.getSettingsObject();
    const scoregraphs = settings.getScoregraphsSetting();
    const scoregraphsSettingValue = scoregraphs.getValue();

    const preferences = playerFile.getEffectiveGamePreferences(game.getName());
    const controlledNations = playerFile.getControlledNationFilenamesInGame(game.getName());
    
    const scoreFile = (fetchedTurnFiles != null) ? fetchedTurnFiles.scores : null;
    const nationTurnFiles = (fetchedTurnFiles != null) ? fetchedTurnFiles.turnFiles : {};

    const payload = new MessagePayload(`**${game.getName()}**: Find below your nation files for **turn ${turnNumber}**.\n\n`);


    if (scoreFile != null && 
        preferences.isReceivingScores() === true && 
        +scoregraphsSettingValue === +settingFlags.VISIBLE_SCOREGRAPHS)
    {
        payload.setAttachment(`scores.html`, scoreFile);
    }

    controlledNations.forEach((nationFilename) =>
    {
        // If it's a string, then an error occurred; add it onto the payload as a message
        if (assert.isString(nationTurnFiles[nationFilename]) === true)
            payload.addContent(`**${nationFilename}**: ${nationTurnFiles[nationFilename]}`);

        else if (nationTurnFiles[nationFilename] != null)
            payload.setAttachment(`${game.getName()}-${nationFilename}-T${turnNumber}.trn`, nationTurnFiles[nationFilename]);
    });


    return payload;
}
