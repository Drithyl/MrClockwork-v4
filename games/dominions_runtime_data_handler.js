
const log = require("../logger.js");
const asserter = require("../asserter.js");
const config = require("../config/config.json");
const gameStore = require("./ongoing_games_store.js");
const MessagePayload = require("../discord/prototypes/message_payload.js");
const { getNation } = require("./dominions_nation_store.js");

//Exact error: "Failed to create temp dir 'C:\Users\MistZ\AppData\Local\Temp/dom5_94132'"
const failedToCreateTmpDirErrRegexp = /Failed\s*to\s*create\s*temp\s*dir/i;

//Exact error: "send: Broken pipe"
const brokenPipeErrRegexp = /broken\s*pipe/i;

//Exact error: "bind: Address already in use"
const addressInUseErrRegexp = /address\s*already\s*in\s*use/i;

//Exact error: "Network Error"
const networkErrorErrRegexp = /Network\s*Error/i;

//Exact error: "Terminated"
const terminatedErrRegexp = /terminated/i;

//Exact error: "Map specified by --mapfile was not found" OR
//"Cannot find file map file: 1water200.map\r"
const mapNotFoundErrRegexp = /(Map\s*specified\s*by\s*--mapfile)|(Cannot find file map file)/i;

//Exact error: "myloadmalloc: can't open [path].tga/rgb/png"
const mapImgNotFoundErrRegexp = /can't\s*open\s*.+.(tga)|(.rgb)|(.rgb)|(.png)$/i;

//Exact error: "Can't find mod: WH_6_25.dm"
const modNotFoundRegexp = /can't\s*find\s*mod/i;

//Exact error: "Mod not installed"
const modNotInstalledRegexp = /Mod not installed/i;

//Exact error: "sound: sample '/home/steam/.dominions5/mods/./Dimensional FractureV3.0/tendrils/sounds/will_slosh1.wav' not found"
const soundNotFoundRegexp = /sound:.+not found/i;

//Exact error: "bc: king has throne in capital (p43 c385 h160 vp2) [new game created]"
const throneInCapitalErrRegexp = /king\s*has\s*throne\s*in\s*capital/i;

//Exact error: "bad ai player"
const badAiPlayerErrRegexp = /bad\s*ai\s*player/i;

//Exact error: "/home/steam/Steam/Dominions5/dom5.sh: line 20: 26467 Aborted                 (core dumped) "$BIN" "$@""
const coreDumpedErrRegexp = /\(core\s*dumped\)/i;

/* Exact error: "Dominions version is too old           *
*                Get an update at www.illwinter.com     *
*                myversionX fileversionY nationZ"       */
const versionTooOldErrRegexp = /version\s*is\s*too\s*old/i;

// Related to the above, when the file version starts with a 6, e.g. 618, this refers to a
// Dominions 6 pretender that was submitted to the game. Useful to check if a dom6 pretender
// was submitted to a Dominions 5 game.
const dom6PretenderRegexp = /fileversion6\d* nation\d+/i;

// For the above error, useful to isolate the nation number and convert it to a nation name
const nationNumberGroup = /fileversion6\d* nation(\d+)/i;

//Exact error: "Något gick fel!". Should come last in handling as some more
//errors will also contain this bit into them
const nagotGickFelErrRegexp = /gick\s*fel/i;

//Exact error: "h_mkitms"
//johan has stated that this is an error about forging a bad magic item that shouldn't happen
const itemForgingErrRegexp = /h_mkitms/i;

//Exact error: "Failed to create /[statuspage name]"
const fileCreationErrRegexp = /Failed\s*to\s*create/i;

//Exact error: "The game [game_name] reported the error: *** no site called [site_name] ([replaced_site_name])"
const replacedThroneErrRegexp = /no\s*site\s*called\s*\w+\s*(\w+)/i;

// Exact message: "Setup port [port] (clients may start), open: 35, players 0, ais 0"; this happens very often
// during game setup, and when game starts, doing the countdown each time
const setupMessageRegexp = /setup\s*port\s*\d+/i;

// Exact message: "[game name], Connections 1, No timer (quick host)"; this happens every second or so after game start
const connectionsMessageRegexp = /Connections\s*\d+/i;

// Exact message: "(Arc) (Ul) (Mav) (Sa) (Mac) (Ct) (Pa) (Ag) (Fom) Va+ Rus? *La-", depending on each nation name, normally preceded by the message above; also
// happens every second after game start, as a way to keep the status
const nationsTurnStatusMessageRegExp = /^(((\(?\w{2,3}\)?)|(\*?\w{2,3}\??-?\+?))\s?)+$/;

// Exact message: "newmon: too many sprites (124050)", seems to happen if a mod has too many sprites
const tooManySprites = /newmon: too many sprites \((\d+)\)/;


const generatingNextTurnMessageRegExp = /Generating next turn/i;

const messageHistory = {};
const DEBOUNCE_MS = 600000;
const SILENT_LAUNCH_ARGV = "silent";


module.exports = function(gameName, message)
{
    const game = gameStore.getOngoingGameByName(gameName);

    if (game == null)
        return;

    if (isRunningInSilentLaunchMode() === true && wasFirstMessageSinceSilentLaunchIgnored(gameName) === false) {
        return;
    }

    const parsedMessage = parseData(message);
    handleData(game, parsedMessage);
};


function parseData(message)
{
    // Probably a buffer with data, ignore it too
    if (asserter.isString(message) === false)
    {
        return "";
    }

    return message;
}

function handleData(game, message)
{
    // Ignore all these messages, they don't need special handling
    if (isIgnorableMessage(message) === true)
        return;

    const gameType = game.getType();

    if (failedToCreateTmpDirErrRegexp.test(message) === true)
        handleFailedToCreateTmpDir(game, message);

    else if (addressInUseErrRegexp.test(message) === true)
        handleAddressInUse(game, message);

    else if (networkErrorErrRegexp.test(message) === true)
        handleNetworkError(game, message);

    else if (terminatedErrRegexp.test(message) === true)
        handleTerminated(game, message);

    else if (mapNotFoundErrRegexp.test(message) === true)
        handleMapNotFound(game, message);

    else if (mapImgNotFoundErrRegexp.test(message) === true)
        handleMapImgNotFound(game, message);

    else if (modNotFoundRegexp.test(message) === true)
        handleModNotFound(game, message);

    else if (modNotInstalledRegexp.test(message) === true)
        handleModNotInstalled(game, message);

    else if (soundNotFoundRegexp.test(message) === true)
        handleSoundNotFound(game, message);

    else if (throneInCapitalErrRegexp.test(message) === true)
        handleThroneInCapital(game, message);

    else if (badAiPlayerErrRegexp.test(message) === true)
        handleBadAiPlayer(game, message);

    else if (coreDumpedErrRegexp.test(message) === true)
        handleCoreDumped(game, message);

    else if (versionTooOldErrRegexp.test(message) === true) {
        if (asserter.isDom5GameType(gameType) === true && dom6PretenderRegexp.test(message) === true)
            handleDom6PretenderSubmittedToDom5Game(game, message);

        else handleVersionTooOld(game, message);
    }

    else if (itemForgingErrRegexp.test(message) === true)
        handleItemForgingErr(game, message);

    else if (fileCreationErrRegexp.test(message) === true)
        handleFileCreationErr(game, message);

    else if (nagotGickFelErrRegexp.test(message) === true)
        handleNagotGickFel(game, message);

    else if (replacedThroneErrRegexp.test(message) === true)
        handleReplacedThroneErr(game, message);

    else if (generatingNextTurnMessageRegExp.test(message) === true)
        handleGeneratingNextTurn(game, message);

    else if (tooManySprites.test(message) === true)
        handleTooManySpritesErr(game, message);

    else
    {
        handleUnknownMessage(game, message);
    }
}

function isIgnorableMessage(message)
{
    // Empty string or only whitespace
    if (/\S/.test(message) === false)
        return true;
        
    if (brokenPipeErrRegexp.test(message) === true)
        return true;
        
    if (setupMessageRegexp.test(message) === true)
        return true;

    if (connectionsMessageRegexp.test(message) === true)
        return true;
    
    if (nationsTurnStatusMessageRegExp.test(message) === true)
        return true;

    return false;
}


function handleFailedToCreateTmpDir(game, message)
{
    log.general(log.getVerboseLevel(), `Handling failedToCreateTmpDir error ${message}`);
    debounce(game, `Dominions reported an error: the game instance could not be started because it failed to create a temp dir. Try killing it and launching it again.`);
}

function handleAddressInUse(game, message)
{
    log.general(log.getVerboseLevel(), `Handling addressInUse error ${message}`);
    debounce(game, `The game's port busy. Most likely the game failed to shut down properly, so killing it and relaunching it should work.`);
}

function handleNetworkError(game, message)
{
    log.general(log.getVerboseLevel(), `Handling networkError error ${message}`);
    debounce(game, `The game reported a network error.`);
}

function handleTerminated(game, message)
{
    log.general(log.getVerboseLevel(), `Ignoring terminated error ${message}`);
}

function handleNagotGickFel(game, message)
{
    log.general(log.getVerboseLevel(), `Handling nagotGickFel error ${message}`);
    debounce(game, `Dominions crashed due to an error: ${message}`);
}

function handleMapNotFound(game, message)
{
    log.general(log.getVerboseLevel(), `Handling mapNotFound error ${message}`);

    //this error string is pretty explicit and informative so send it as is
    debounce(game, message);
}

function handleMapImgNotFound(game, message)
{
    log.general(log.getVerboseLevel(), `Handling mapImgNotFound error ${message}`);
    debounce(game, `Dominions reported an error: One or more of the image files of the selected map could not be found. Make sure they've been uploaded and that the .map file points to the proper names:\n\n${message}`);
}

function handleModNotFound(game, message)
{
    log.general(log.getVerboseLevel(), `Handling modNotFound error ${message}`);

    //this error string is pretty explicit and informative so send it as is
    debounce(sendWarning(game, message));
}

function handleModNotInstalled(game, message)
{
    log.general(log.getVerboseLevel(), `Handling modNotInstalled error ${message}`);

    //this error string is pretty explicit and informative so send it as is
    debounce(sendWarning(game, "One of the mods chosen is not installed on the server. Did it get deleted after the game was hosted?"));
}

function handleSoundNotFound(game, message)
{
    log.general(log.getVerboseLevel(), `Handling soundNotFound error ${message}`);

    //this error string is pretty explicit and informative so send it as is
    debounce(game, message);
}

function handleThroneInCapital(game, message)
{
    log.general(log.getVerboseLevel(), `Handling throneInCapital error ${message}`);
    debounce(game, `Dominions reported an error: A throne was probably forced to start on a player's capital. Check the pre-set starts and thrones in the .map file (original error is: bc: king has throne in capital (p43 c385 h160 vp2) [new game created])`);
}

function handleBadAiPlayer(game, message)
{
    log.general(log.getVerboseLevel(), `Handling badAiPlayer error ${message}`);
    debounce(game, `Dominions reported an error: one of the AI players has an invalid nation number.`);
}

function handleCoreDumped(game, message)
{
    log.general(log.getVerboseLevel(), `Ignoring codeDumped error ${message}`);
    //don't send error here as this comes coupled with other more explicit errors
}

function handleDom6PretenderSubmittedToDom5Game(game, message)
{
    const offendingNationNumber = +message.match(nationNumberGroup)[0].replace(nationNumberGroup, "$1");
    const offendingNation = getNation(offendingNationNumber, config.dom6GameTypeName);

    log.general(log.getVerboseLevel(), `Handling dom6PretenderSubmittedToDom5Game error ${message}`);
    debounce(game, `This is a Dominions 5 game, but someone submitted a Dominions 6 pretender (**${offendingNation.getFullName()}**), which is making it crash. Remove this pretender to fix it.`);
}

function handleVersionTooOld(game, message)
{
    log.general(log.getVerboseLevel(), `Handling versionTooOld error ${message}`);
    debounce(game, `The game has crashed because a new Dominions version is available. Please be patient while the admins update the servers :)`);
}

function handleItemForgingErr(game, message)
{
    log.general(log.getVerboseLevel(), `Handling itemForging error ${message}`);
    debounce(game, `The game has crashed on turn generation due to an error caused by forging a bad item. This should theoretically not happen.`);
}

function handleFileCreationErr(game, message)
{
    log.general(log.getVerboseLevel(), `Ignoring fileCreation error ${message}`);
}

function handleReplacedThroneErr(game, message)
{
    log.general(log.getVerboseLevel(), `Handling replacedThrone error ${message}`);
    debounce(game, `A site was replaced in this mod but Dominions considers it an error. This has no impact in the game other than this warning message:\n\n\`\`\`     ${message}\`\`\``);
}

function handleGeneratingNextTurn(game)
{
    log.general(log.getNormalLevel(), `${game.getName()}\tGenerating new turn...`);
    game.sendMessageToChannel(`Generating new turn; this *can* take a while...`);
}

function handleTooManySpritesErr(game, message)
{
    log.general(log.getVerboseLevel(), `Handling tooManySprites error ${message}`);

    //this error string is pretty explicit and informative so send it as is
    debounce(game, message);
}


function handleUnknownMessage(game, message)
{
    // Don't send channel warnings if this is an unidentified message; could just clutter things up
    log.general(log.getNormalLevel(), `Game ${game.getName()} reported an unknown message`, message);
    debounce(game, `The game encountered an unknown error:\n\n    ${message}`);
}

function debounce(game, message)
{
    if (wasLastErrorSentRecently(game.getName(), message) === true)
        return;

    addToHistory(game.getName(), message);
    sendWarning(game, message);
}

function isRunningInSilentLaunchMode() {
    return process.argv.some((arg) => arg.toLowerCase() === SILENT_LAUNCH_ARGV) === true;
}

function wasFirstMessageSinceSilentLaunchIgnored(gameName) {
    if (messageHistory[gameName] != null && messageHistory[gameName].alreadyIgnoredFirstMessage === true) {
        return true;
    }

    if (messageHistory[gameName] == null)
        messageHistory[gameName] = {};
    
    messageHistory[gameName].alreadyIgnoredFirstMessage = true;
    return false;
}

function addToHistory(gameName, message)
{
    if (messageHistory[gameName] == null)
        messageHistory[gameName] = {};

    messageHistory[gameName][message] = Date.now();
}

function wasLastErrorSentRecently(gameName, message)
{
    if (messageHistory[gameName] == null || messageHistory[gameName][message] == null)
        return false;

    if (Date.now() - messageHistory[gameName][message] <= DEBOUNCE_MS)
        return true;
}

function sendWarning(game, warning)
{
    const channel = game.getChannel();

    if (channel != null)
    {
        log.general(log.getVerboseLevel(), `Sending error warning to ${game.getName()}'s channel`);
        return new MessagePayload(warning).send(channel)
        .catch((err) => log.error(log.getVerboseLevel(), `ERROR sending warning`, err));
    }

    else log.general(log.getVerboseLevel(), `Cannot send ${game.getName()}'s warning; channel does not exist`);
}
