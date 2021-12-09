
const TimeLeft = require("./time_left.js");
const assert = require("../../asserter.js");
const config = require("../../config/config.json");
const SpawnedProcess = require("../../spawned_process.js");

const PROCESS_TIMEOUT_MS = config.queryProcessTimeout;
const IN_LOBBY = "Game is being setup";
const STARTED = "Game is active";
const SERVER_OFFLINE = "Host server offline";
const GAME_OFFLINE = "Game offline";

module.exports.fetchDom5Status = fetchGameStatus;
module.exports.queryDom5Status = queryGame;
module.exports.Dominions5Status = Dominions5Status;

async function fetchGameStatus(gameObject)
{
    const isOnline = await gameObject.isOnlineCheck();
    const dom5Status = new Dominions5Status(gameObject);

    dom5Status.setName(gameObject.getName());

    if (gameObject.isServerOnline() === false)
    {
        dom5Status.setStatus(SERVER_OFFLINE);
        return dom5Status;
    }

    else if (isOnline === false)
    {
        dom5Status.setStatus(GAME_OFFLINE);
        return dom5Status;
    }

    const statusdumpWrapper = await gameObject.fetchStatusDump();

    if (statusdumpWrapper == null)
        return dom5Status;

    dom5Status.setLastUpdateTimestamp(statusdumpWrapper.lastUpdateTimestamp);
    dom5Status.setTurnNumber(statusdumpWrapper.turnNbr);
    dom5Status.setPlayers(statusdumpWrapper.nationStatusArray);

    if (statusdumpWrapper.hasStarted === false)
        dom5Status.setStatus(IN_LOBBY);

    else if (statusdumpWrapper.hasStarted === true)
        dom5Status.setStatus(STARTED);

    return dom5Status;
}

async function queryGame(gameObject)
{
    const isOnline = await gameObject.isOnlineCheck();
    const statusObject = new Dominions5Status(gameObject);
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

    statusObject.setName(gameObject.getName());

    if (gameObject.isServerOnline() === false)
    {
        statusObject.setStatus(SERVER_OFFLINE);
        return statusObject;
    }

    else if (isOnline === false)
    {
        statusObject.setStatus(GAME_OFFLINE);
        return statusObject;
    }

    const _process = new SpawnedProcess(config.pathToDom5Exe, cmdFlags);

    return new Promise((resolve, reject) =>
    {
        var wasSettled = false;

        // Introduce a timeout mechanism in case the process hangs for too long
        setTimeout(() =>
        {
            if (wasSettled === true)
                return;

            _process.kill();
            reject(new Error(`${gameObject.getName()}'s query process timed out`));
            wasSettled = true;

        }, PROCESS_TIMEOUT_MS);

        _process.readWholeStdoutData()
        .then((tcpQueryResponse) => 
        {
            _parseTcpQuery(tcpQueryResponse, statusObject);
            resolve(statusObject);
            wasSettled = true;
        });

        _process.onError((error) => 
        {
            reject(error);
            wasSettled = true;
        });

        _process.onExited((code, signal) => 
        {
            if (wasSettled === false)
            {
                reject(new Error(`Process exited without generating stdout data. Code: ${code}, Signal: ${signal}`));
                wasSettled = true;
            }
        });

        _process.onTerminated((code, signal) => 
        {
            if (wasSettled === false)
            {
                reject(new Error(`Process was terminated without generating stdout data. Code: ${code}, Signal: ${signal}`));
                wasSettled = true;
            }
        });
    });
}

function _parseTcpQuery(tcpQueryResponse, statusObject)
{
    assert.isStringOrThrow(tcpQueryResponse);

    const name = _parseGameName(tcpQueryResponse);
    const status = _parseStatus(tcpQueryResponse);
    const isPaused = _parseIsPaused(tcpQueryResponse);
    const turnNumber = _parseTurnNumber(tcpQueryResponse);
    const msLeft = _parseMsLeft(tcpQueryResponse);
    const players = _parsePlayers(tcpQueryResponse);

    statusObject.setName(name);
    statusObject.setStatus(status);
    statusObject.setIsPaused(isPaused);
    statusObject.setTurnNumber(turnNumber);
    statusObject.setMsLeft(msLeft);
    statusObject.setPlayers(players);

    return statusObject;
}

function Dominions5Status(gameObject)
{
    const _game = gameObject;

    var _name = "";
    var _status = "Unknown";
    var _isPaused = false;
    var _turnNumber;
    var _msLeft;
    var _players;
    var _lastTurnTimestamp;
    var _isTurnProcessing = false;
    var _lastUpdateTimestamp;

    this.getName = () => _name;
    this.setName = (name) =>
    {
        if (assert.isString(name) === true)
            _name = name;
    };

    this.getStatus = () => _status;
    this.setStatus = (statusStr) =>
    {
        if (assert.isString(statusStr) === true)
            _status = statusStr;
    };

    this.isPaused = () => _isPaused;
    this.setIsPaused = (isPaused) =>
    {
        if (assert.isBoolean(isPaused) === true)
            _isPaused = isPaused;
    };

    this.isTurnProcessing = () => _isTurnProcessing;
    this.setIsTurnProcessing = (isTurnProcessing) =>
    {
        if (assert.isBoolean(isTurnProcessing) === true)
            _isTurnProcessing = isTurnProcessing;
    };

    this.getTurnNumber = () => _turnNumber;
    this.incrementTurn = () => _turnNumber++;
    this.setTurnNumber = (turnNumber) =>
    {
        if (assert.isInteger(turnNumber) === false)
            return;
            
        if (turnNumber === -1 || turnNumber >= 1)
            _turnNumber = turnNumber;
    };

    this.getMsLeft = () => _msLeft;
    this.setMsLeft = (msLeft) =>
    {
        if (assert.isInteger(msLeft) === true)
            _msLeft = msLeft;
    };
    
    this.setMsToDefaultTimer = (game) =>
    {
        const timerSetting = game.getSettingsObject().getTimerSetting();
        const timePerTurnObject = timerSetting.getValue();
        const msPerTurn = timePerTurnObject.getMsLeft();

        if (assert.isInteger(msPerTurn) === true)
            _msLeft = msPerTurn;
    };

    this.getPlayers = () => (assert.isArray(_players)) ? [..._players] : null;
    this.setPlayers = (players) =>
    {
        if (assert.isArray(players) === true)
            _players = players;
    };

    this.areAllTurnsDone = () =>
    {
        if (assert.isArray(_players) === false || _players.length <= 0)
            return false;

        return _players.find((player) => player.isTurnFinished === false && player.isAi === false) == null;
    };

    // Turns which have never been opened by their player
    this.getUncheckedTurns = () =>
    {
        if (assert.isArray(_players) === false)
            return null;

        const uncheckedNations = _players.filter((nationData) => {
            return nationData.isAi === false && nationData.wasTurnChecked === false
        });

        return uncheckedNations.map((nation) => nation.fullName);
    };

    // Turns which have not been marked as unfinished (done, but not finished)
    this.getUnfinishedTurns = () =>
    {
        if (assert.isArray(_players) === false)
            return null;

        const unfinishedNations = _players.filter((nationData) => {
            return nationData.isAi === false && nationData.isTurnUnfinished === true && nationData.isTurnFinished === false
        });

        return unfinishedNations.map((nation) => nation.fullName);
    };

    // Turns which have not been marked as finished (can be unchecked or unfinished)
    this.getUndoneTurns = () =>
    {
        if (assert.isArray(_players) === false)
            return null;

        const undoneNations = _players.filter((nationData) => {
            return nationData.isAi === false &&  nationData.isTurnFinished === false
        });

        return undoneNations.map((nation) => nation.fullName);
    };

    this.getLastTurnTimestamp = () => _lastTurnTimestamp; 
    this.setLastTurnTimestamp = (timestamp) =>
    {
        if (assert.isInteger(timestamp) === true)
            _lastTurnTimestamp = timestamp;
    };

    this.getLastUpdateTimestamp = () => _lastUpdateTimestamp;
    this.setLastUpdateTimestamp = (timestamp) =>
    {
        if (assert.isInteger(timestamp) === true)
            _lastUpdateTimestamp = timestamp;
    };


    this.isInLobby = () => _status === IN_LOBBY;
    this.isOngoing = () => _status === STARTED;
    this.isOnline = () => _status !== GAME_OFFLINE;
    this.isServerOnline = () => _status !== SERVER_OFFLINE;


    this.getTimeLeft = () =>
    {
        if (this.isOngoing() === false)
            return null;

        return new TimeLeft(_msLeft);
    };

    this.copyTimerValues = (statusObject) =>
    {
        assert.isInstanceOfPrototypeOrThrow(statusObject, Dominions5Status);

        this.setIsPaused(statusObject.isPaused());
        this.setMsLeft(statusObject.getMsLeft());
        this.setIsTurnProcessing(statusObject.isTurnProcessing());
    };

    this.clone = () =>
    {
        const clonedStatus = new Dominions5Status();

        clonedStatus.setName(_name);
        clonedStatus.setStatus(_status);
        clonedStatus.setIsPaused(_isPaused);
        clonedStatus.setTurnNumber(_turnNumber);
        clonedStatus.setMsLeft(_msLeft);
        clonedStatus.setPlayers(_players);
        clonedStatus.setLastTurnTimestamp(_lastTurnTimestamp);
        clonedStatus.setLastUpdateTimestamp(Date.now());

        return clonedStatus;
    };

    this.advanceTimer = (maxMs) =>
    {
        const delta = Date.now() - _lastUpdateTimestamp;
        const elapsedMs = Math.min(maxMs, delta);

        if (assert.isInteger(_msLeft) === true && assert.isInteger(elapsedMs) === true)
            this.setMsLeft(Math.max(_msLeft - elapsedMs, 0));

        return this;
    };

    this.toJSON = () =>
    {
        const jsonData = {
            name: _name,
            status: _status,
            isPaused: _isPaused,
            turnNumber: _turnNumber,
            msLeft: _msLeft,
            players: _players,
            lastTurnTimestamp: _lastTurnTimestamp,
            lastUpdateTimestamp: _lastUpdateTimestamp
        };

        return jsonData;
    };

    this.fromJSON = (data) =>
    {
        this.setName(data.name);
        this.setStatus(data.status);
        this.setIsPaused(data.isPaused);
        this.setTurnNumber(data.turnNumber);
        this.setMsLeft(data.msLeft);
        this.setPlayers(data.players);
        this.setLastTurnTimestamp(data.lastTurnTimestamp);
        this.setLastUpdateTimestamp(data.lastUpdateTimestamp);
    };
}


function _parseGameName(tcpQueryResponse)
{
    let nameLine = tcpQueryResponse.match(/Gamename:.+/i);
    let name = (nameLine != null) ? nameLine[0].replace(/Gamename:\s+/i, "").trim() : "Could not find name";
    return name;
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

/** WHEN ACTIVE AND PAUSED, "Time left" will show as 
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