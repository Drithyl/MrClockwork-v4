
/**
 * This module is mutually exclusive with dominions_statusdump.js
 * They are both methods to get the current status of a Dom
 * game. This one launches a Dom instance with the --tcpquery
 * flag on, which returns a raw string through the stdout of
 * the spawned child process. This is then parsed into an
 * object. See bottom of the module for details on the format
 * of the raw tcpquery output.
 */


const assert = require("../../asserter.js");
const config = require("../../config/config.json");
const TimeoutPromise = require("../../timeout_promise.js");
const SpawnedProcess = require("../../spawned_process.js");
const DominionsStatusSnapshot = require("./dominions_status_snapshot.js");
const { getDominionsExePath } = require("../../helper_functions.js");

const PROCESS_TIMEOUT_MS = config.queryProcessTimeout;

const IN_LOBBY = "Game is being setup";
const ACTIVE = "Game is active";

module.exports.queryDomStatus = queryGame;


async function queryGame(gameObject)
{
    var isOnline;
    const statusSnapshot = new DominionsStatusSnapshot();
    statusSnapshot.setIsServerOnline(gameObject.isServerOnline());

    if (statusSnapshot.isServerOnline() === false)
        return statusSnapshot;

        
    isOnline = await gameObject.isOnlineCheck();
    statusSnapshot.setIsOnline(isOnline);

    
    if (statusSnapshot.isOnline() === false)
        return statusSnapshot;


    const rawData = await _fetchTcpqueryData(gameObject);
    _parseTcpQuery(rawData, statusSnapshot);
    return statusSnapshot;
}

function _fetchTcpqueryData(gameObject)
{
    const ip = gameObject.getIp();
    const port = gameObject.getPort();
    const cmdFlags = [
        "--textonly",
        "--tcpquery",
        "--nosteam",
        "--nodownlmods",
        "--ipadr", ip,
        "--port", port
    ];
    const pathToExe = getDominionsExePath(gameObject.getType());
    const _process = new SpawnedProcess(pathToExe, cmdFlags);

    return TimeoutPromise(async (resolve, reject) =>
    {
        const stdoutData = await _process.readWholeStdoutData();

        _process.onError((error) => reject(error));

        _process.onExited((code, signal) => {
            reject(new Error(`Process exited without generating stdout data. Code: ${code}, Signal: ${signal}`));
        });

        _process.onTerminated((code, signal) => {
            reject(new Error(`Process was terminated without generating stdout data. Code: ${code}, Signal: ${signal}`));
        });

        resolve(stdoutData);

    }, PROCESS_TIMEOUT_MS);
}

function _parseTcpQuery(tcpQueryResponse, statusSnapshot)
{
    assert.isStringOrThrow(tcpQueryResponse);

    const status = _parseStatus(tcpQueryResponse);

    if (status === IN_LOBBY)
        statusSnapshot.setHasStarted(false);

    else if (status === ACTIVE)
        statusSnapshot.setHasStarted(true);
    
    statusSnapshot.setIsPaused(_parseIsPaused(tcpQueryResponse));
    statusSnapshot.setMsLeft(_parseMsLeft(tcpQueryResponse));
    statusSnapshot.setTurnNumber(_parseTurnNumber(tcpQueryResponse));
    statusSnapshot.setPlayers(_parsePlayers(tcpQueryResponse));
    statusSnapshot.setSuccessfulCheckTimestamp(Date.now());
    statusSnapshot.setLastUpdateTimestamp(Date.now());

    return statusSnapshot;
}

function _parseStatus(tcpQueryResponse)
{
    let statusLine = tcpQueryResponse.match(/Status:.+/i);
    let status = (statusLine != null) ? statusLine[0].replace(/Status:\s+/i, "").trim() : "Unknown";

    if (tcpQueryResponse.includes("Connection failed") === true)
        return "Game offline";

    return status;
}

function _parseIsPaused(tcpQueryResponse)
{
    let msLeftLine = tcpQueryResponse.match(/Time left:.+/i);
    let msLeft = (msLeftLine != null) ? +msLeftLine[0].replace(/\D+/g, "") : undefined;
    return msLeft;
}

function _parseTurnNumber(tcpQueryResponse)
{
    let turnLine = tcpQueryResponse.match(/Turn:.+/i);
    let turnNumber = (turnLine != null) ? +turnLine[0].replace(/\D+/g, "") : 0;
    return turnNumber;
}

function _parseMsLeft(tcpQueryResponse)
{
    let msLeftLine = tcpQueryResponse.match(/Time left:.+/i);
    let msLeft = (msLeftLine != null) ? +msLeftLine[0].replace(/\D+/g, "") : undefined;
    return msLeft;
}

function _parsePlayers(tcpQueryResponse)
{
    let playersLines = tcpQueryResponse.match(/player\s*\d+:.+/ig);
    let players = (playersLines != null) ? playersLines.map((line) => line.replace(/player\s*\w+:/i, "").trim()) : undefined;

    if (Array.isArray(players) === true)
    {
        players = players.map((playerString) => 
        {
            const name = playerString.replace(/^(.+)\s\(.+$/ig, "$1");
            const turnStatus = playerString.replace(/^.+\s\((.+)\)$/ig, "$1");
            var isTurnFinished = false;
            var isAi = false;

            if (turnStatus === "played")
                isTurnFinished = true;
                
            if (turnStatus === "AI controlled")
                isAi = true;

            return { name, isTurnFinished, isAi };
        });
    }

    return players;
}


/** NO OUTPUT WHILE START IS GENERATING; GAME BLOCKS THE TCPQUERY OPERATION */

/** OUTPUT WHEN GAME IS OFFLINE (SERVER NOT AVAILABLE) 
 * 
 * Connecting to Server (127.0.0.1:6000)
 * Connection failed
 * 
*/

/** IN LOBBY, BEING SETUP GAME TCPQUERY OUTPUT:
 * 
 * Connecting to Server (127.0.0.1:6000)                          
 * Waiting for game info                                          
 * Gamename: testGame                                             
 * Status: Game is being setup
 * 
 */

/** STARTED, ACTIVE GAME TCPQUERY OUTPUT:
 * 
 * Connecting to Server (127.0.0.1:6000)                          
 * Waiting for game info                                          
 * Gamename: testGame                                             
 * Status: Game is active                                         
 * Turn: 1                                                        
 * Time left: 3599672 ms                                          
 * player 5: Arcoscephale, Golden Era (AI controlled)             
 * player 7: Ulm, Enigma of Steel (AI controlled)                 
 * player 20: Vanheim, Age of Vanir (-)
 * 
 */

/** WHEN STARTED AND PAUSED, "Time left" will show as 
 * Connecting to Server (127.0.0.1:6000)
 * Waiting for game info
 * Gamename: timerTest
 * Status: Game is active
 * Turn: 1
 * Time left: 0 ms
 * player 5: Arcoscephale, Golden Era (AI controlled)
 * player 6: Ermor, New Faith (AI controlled)
 * player 13: Abysia, Children of Flame (-)
*/

/** AI NATION TURN SHOWS AS
 * player 7: Ulm, Enigma of Steel (AI controlled)
 * 
 */

/** NATION TURN NOT CHECKED SHOWS AS
 * player 20: Vanheim, Age of Vanir (-)
 * 
 */

 /** NATION TURN MARKED AS UNFINISHED
 * player 20: Vanheim, Age of Vanir (played, but not finished)
 * 
 */

 /** NATION FINISHED TURN
 * player 20: Vanheim, Age of Vanir (played)
 * 
 */