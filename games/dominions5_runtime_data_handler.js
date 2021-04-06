
const log = require("../logger.js");
const messenger = require("../discord/messenger.js");
const gameStore = require("./ongoing_games_store.js");

//Exact error: "Failed to create temp dir 'C:\Users\MistZ\AppData\Local\Temp/dom5_94132'"
const failedToCreateTmpDirErrRegexp = new RegExp("Failed\\s*to\\s*\\create\\s*temp\\s*dir", "i");

//Exact error: "send: Broken pipe"
const brokenPipeErrRegexp = new RegExp("broken\\s*pipe", "i");

//Exact error: "bind: Address already in use"
const addressInUseErrRegexp = new RegExp("address\\s*already\\s*in\\s*use", "i");

//Exact error: "Terminated"
const terminatedErrRegexp = new RegExp("terminated", "i");

//Exact error: "Map specified by --mapfile was not found"
const mapNotFoundErrRegexp = new RegExp("Map\\s*specified\\s*by\\s*--mapfile", "i");

//Exact error: "myloadmalloc: can't open [path].tga/rgb/png"
const mapImgNotFoundErrRegexp = new RegExp("can\\'t\\s*open\\s*.+.(tga)|(.rgb)|(.rgb)|(.png)$", "i");

//Exact error: "bc: king has throne in capital (p43 c385 h160 vp2) [new game created]"
const throneInCapitalErrRegexp = new RegExp("king\\s*has\\s*throne\\s*in\\s*capital", "i");

//Exact error: "bad ai player"
const badAiPlayerErrRegexp = new RegExp("bad\\s*ai\\s*player", "i");

//Exact error: "/home/steam/Steam/Dominions5/dom5.sh: line 20: 26467 Aborted                 (core dumped) "$BIN" "$@""
const coreDumpedErrRegexp = new RegExp("\\(core\\s*dumped\\)", "i");

/* Exact error: "Dominions version is too old           *
*                Get an update at www.illwinter.com     *
*                myversionX fileversionY nationZ"       */
const versionTooOldErrRegexp = new RegExp("version\\s*is\\s*too\\s*old", "i");

//Exact error: "Något gick fel!". Should come last in handling as some more
//errors will also contain this bit into them
const nagotGickFelErrRegexp = new RegExp("gick\\s*fel", "i");

//Exact error: "h_mkitms"
//johan has stated that this is an error about forging a bad magic item that shouldn't happen
const itemForgingErrRegexp = new RegExp("h_mkitms", "i");

//Exact error: "Failed to create /[statuspage name]"
const fileCreationErrRegexp = new RegExp("Failed\\s*to\\s*create", "i");

//Exact error: "The game [game_name] reported the error: *** no site called [site_name] ([replaced_site_name])"
const replacedThroneErrRegexp = new RegExp("no\\s*site\\s*called\\s*\\w+\\s*(\\w+)", "i");

// Exact message: "Setup port [port] (clients may start), open: 35, players 0, ais 0"
const setupMessageRegexp = new RegExp("Setup\\s*port\\s*\\d+\\s*(clients\\s*may\\s*start)", "i");

const replacedThroneErrArray = [];

module.exports = function(gameName, message)
{
    const game = gameStore.getOngoingGameByName(gameName);

    if (game == null)
        return log.error(log.getNormalLevel(), `GAME ${gameName} REPORTED AN ERROR; BUT COULD NOT FIND IT IN STORE`, message);

    if (message == null)
        return log.error(log.getNormalLevel(), `GAME ${gameName} REPORTED AN ERROR; BUT DID NOT RECEIVE DATA ABOUT IT`);


    // Probably a buffer with data, ignore it too
    if (assert.isString(message) === false)
        return log.general(log.getVerboseLevel(), `Ignoring ${gameName} data`, message);

    // Ignore all these messages, they don't need special handling
    if (setupMessageRegexp.test(message) === true)
        return log.general(log.getVerboseLevel(), `Ignoring ${gameName} message ${message}`);


    if (failedToCreateTmpDirErrRegexp.test(message) === true)
        handleFailedToCreateTmpDir(game, message);

    else if (brokenPipeErrRegexp.test(message) === true)
        handleBrokenPipe(game, message);

    else if (addressInUseErrRegexp.test(message) === true)
        handleAddressInUse(game, message);

    else if (terminatedErrRegexp.test(message) === true)
        handleTerminated(game, message);

    else if (mapNotFoundErrRegexp.test(message) === true)
        handleMapNotFound(game, message);

    else if (mapImgNotFoundErrRegexp.test(message) === true)
        handleMapImgNotFound(game, message);

    else if (throneInCapitalErrRegexp.test(message) === true)
        handleThroneInCapital(game, message);

    else if (badAiPlayerErrRegexp.test(message) === true)
        handleBadAiPlayer(game, message);

    else if (coreDumpedErrRegexp.test(message) === true)
        handleCoreDumped(game, message);

    else if (versionTooOldErrRegexp.test(message) === true)
        handleVersionTooOld(game, message);

    else if (itemForgingErrRegexp.test(message) === true)
        handleItemForgingErr(game, message);

    else if (fileCreationErrRegexp.test(message) === true)
        handleFileCreationErr(game, message);

    else if (nagotGickFelErrRegexp.test(message) === true)
        handleNagotGickFel(game, message);

    else if (replacedThroneErrRegexp.test(message) === true)
        handleReplacedThroneErr(game, message);

    else
    {
        log.error(log.getLeanLevel(), `GAME ${game.getName()} REPORTED AN UNKNOWN MESSAGE`, message);
        sendWarning(game, `The game ${game.getName()} reported the message:\n\n${message}`);
    }
};

function handleFailedToCreateTmpDir(game, message)
{
    log.general(log.getVerboseLevel(), `Handling failedToCreateTmpDir error ${message}`);
    sendWarning(game, `Dominions reported an error: the game instance could not be started because it failed to create a temp dir. Try killing it and launching it again.`);
}

function handleBrokenPipe(game, message)
{
    log.general(log.getVerboseLevel(), `Ignoring brokenPipe error ${message}`);
}

function handleAddressInUse(game, message)
{
    log.general(log.getVerboseLevel(), `Handling addressInUse error ${message}`);
    sendWarning(game, `The port used by this game is already in use. Most likely the game failed to shut down properly, so killing it and relaunching it should work.`);
}

function handleTerminated(game, message)
{
    log.general(log.getVerboseLevel(), `Ignoring terminated error ${message}`);
}

function handleNagotGickFel(game, message)
{
    log.general(log.getVerboseLevel(), `Handling nagotGickFel error ${message}`);
    sendWarning(game, `Dominions crashed due to an error: ${message}`);
}

function handleMapNotFound(game, message)
{
    log.general(log.getVerboseLevel(), `Handling mapNotFound error ${message}`);

    //this error string is pretty explicit and informative so send it as is
    sendWarning(game, message);
}

function handleMapImgNotFound(game, message)
{
    log.general(log.getVerboseLevel(), `Handling mapImgNotFound error ${message}`);
    sendWarning(game, `Dominions reported an error: One or more of the image files of the selected map could not be found. Make sure they've been uploaded and that the .map file points to the proper names.`);
}

function handleThroneInCapital(game, message)
{
    log.general(log.getVerboseLevel(), `Handling throneInCapital error ${message}`);
    sendWarning(game, `Dominions reported an error: A throne was probably forced to start on a player's capital. Check the pre-set starts and thrones in the .map file (original error is: bc: king has throne in capital (p43 c385 h160 vp2) [new game created])`);
}

function handleBadAiPlayer(game, message)
{
    log.general(log.getVerboseLevel(), `Handling badAiPlayer error ${message}`);
    sendWarning(game, `Dominions reported an error: one of the AI players has an invalid nation number.`);
}

function handleCoreDumped(game, message)
{
    log.general(log.getVerboseLevel(), `Ignoring codeDumped error ${message}`);
    //don't send error here as this comes coupled with other more explicit errors
}

function handleVersionTooOld(game, message)
{
    log.general(log.getVerboseLevel(), `Handling versionTooOld error ${message}`);
    sendWarning(game, `The game has crashed because a new Dominions version is available. Please be patient while the admins update the servers :)`);
}

function handleItemForgingErr(game, message)
{
    log.general(log.getVerboseLevel(), `Handling itemForging error ${message}`);
    sendWarning(game, `The game has crashed on turn generation due to an error caused by forging a bad item. This should theoretically not happen.`);
}

function handleFileCreationErr(game, message)
{
    log.general(log.getVerboseLevel(), `Ignoring fileCreation error ${message}`);
}

function handleReplacedThroneErr(game, message)
{
    log.general(log.getVerboseLevel(), `Handling replacedThrone error ${message}`);

    if (replacedThroneErrArray.includes(game.getName()) === true)
        return;

    replacedThroneErrArray.push(game.getName());
    sendWarning(game, `A site was replaced in this mod but Dominions considers it an error. This has no impact in the game other than this warning message:\n\n${message}`);
}

function addToHistory(game, message)
{
    errorHistory[game.getName()] = Date.now();
}

function wasLastErrorSentRecently(game)
{
    if (errorHistory[game.getName()] == null)
        return false;

    if (Date.now() - errorHistory[game.getName()] <= 60000)
        return true;
}

function sendWarning(game, warning)
{
    const channel = game.getChannel();

    if (channel != null)
    {
        log.general(log.getVerboseLevel(), `Sending error warning to ${game.getName()}'s channel`);
        messenger.send(channel, warning)
        .catch((err) => log.error(log.getVerboseLevel(), `ERROR sending warning`, err));
    }

    else log.general(log.getVerboseLevel(), `Cannot send ${game.getName()}'s warning; channel does not exist`);
}
