
const TimeLeft = require("./time_left.js");
const assert = require("../../asserter.js");
const config = require("../../config/config.json");
const SpawnedProcess = require("../../spawned_process.js");

module.exports = queryGame;

function queryGame(gameObject)
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

    const _process = new SpawnedProcess(config.pathToDom5Exe, cmdFlags);

    return new Promise((resolve, reject) =>
    {
        _process.onError((error) => reject(error));

        _process.onStdoutData((tcpQueryResponse) => 
        {
            const query = new Dominions5TcpQuery(tcpQueryResponse);

            if (gameObject.isServerOnline() === false)
                query.status = "Host server offline";

            resolve(query);
        });
    });
}

function Dominions5TcpQuery(tcpQueryResponse)
{
    assert.isStringOrThrow(tcpQueryResponse);

    this.name = parseGameName(tcpQueryResponse);
    this.status = parseStatus(tcpQueryResponse);
    this.turnNumber = parseTurnNumber(tcpQueryResponse);
    this.msLeft = parseMsLeft(tcpQueryResponse);
    this.players = parsePlayers(tcpQueryResponse);

    this.isInLobby = () => this.status === "Game is being setup";
    this.isOngoing = () => this.status === "Game is active";

    this.isOnline = () => this.isInLobby() || this.isOngoing();
    this.isServerOnline = () => this.status !== "Host server offline";

    this.getTimeLeft = () =>
    {
        if (this.isOngoing() === false)
            return null;

        return new TimeLeft(this.msLeft);
    };
}

function parseGameName(tcpQueryResponse)
{
    let nameLine = tcpQueryResponse.match(/Gamename:.+/i);
    let name = (nameLine != null) ? nameLine[0].replace(/Gamename:\s+/i, "").trim() : "Could not find name";
    return name;
}

function parseStatus(tcpQueryResponse)
{
    let statusLine = tcpQueryResponse.match(/Status:.+/i);
    let status = (statusLine != null) ? statusLine[0].replace(/Status:\s+/i, "").trim() : "Could not find status";

    if (tcpQueryResponse.includes("Connection failed") === true)
        return "Game offline";

    return status;
}

function parseTurnNumber(tcpQueryResponse)
{
    let turnLine = tcpQueryResponse.match(/Turn:.+/i);
    let turnNumber = (turnLine != null) ? +turnLine[0].replace(/\D+/g, "") : 0;
    return turnNumber;
}

function parseMsLeft(tcpQueryResponse)
{
    let msLeftLine = tcpQueryResponse.match(/Time left:.+/i);
    let msLeft = (msLeftLine != null) ? +msLeftLine[0].replace(/\D+/g, "") : undefined;
    return msLeft;
}

function parsePlayers(tcpQueryResponse)
{
    let playersLines = tcpQueryResponse.match(/player\s*\d+:.+/ig);
    let players = (playersLines != null) ? playersLines.map((line) => line.replace(/player\s*\w+:/i, "").trim()) : undefined;

    if (Array.isArray(players) === true)
    {
        players = players.map((playerString) => 
        {
            const name = playerString.replace(/^(.+)\s\(.+$/ig, "$1");
            const turnStatus = playerString.replace(/^.+\s\((.+)\)$/ig, "$1");
            var isTurnDone = false;
            var isAi = false;

            if (turnStatus === "AI controlled" || turnStatus === "played")
                isTurnDone = true;
                
            if (turnStatus === "AI controlled")
                isAi = true;

            return { name, isTurnDone, isAi };
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

/** ACTIVE, STARTED GAME TCPQUERY OUTPUT:
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