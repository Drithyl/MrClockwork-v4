
const TimeLeft = require("./time_left.js");
const assert = require("../../asserter.js");
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
            return verifyTcpQueryResponse(tcpQueryResponse)
            .then((response) => resolve(new Dominions5TcpQuery(response)))
            .catch((error) => reject(error));
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
    this.timeLeft = new TimeLeft(this.msLeft);
    this.players = parsePlayers(tcpQueryResponse);
}

function verifyTcpQueryResponse(tcpQueryResponse)
{
    //response is not guaranteed to be valid; a wrong ip produce a response
    //with an error rather than the expected tcpquery data
    if (tcpQueryResponse.toLowerCase().includes("status:") === false)
    {
        return Promise.reject(new Error(tcpQueryResponse));
    }

    return Promise.resolve(tcpQueryResponse);
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
    let msLeft = (timeLeftLine != null) ? +msLeftLine[0].replace(/\D+/g, "") : undefined;
    return msLeft;
}

function parsePlayers(tcpQueryResponse)
{
    let playersLines = tcpQueryResponse.match(/player\s*\d+:.+/ig);
    let players = (playersLines != null) ? playersLines.map((line) => line.replace(/player\s*\w+:/i, "").trim()) : undefined;
    return players;
}