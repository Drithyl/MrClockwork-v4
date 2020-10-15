"use strict";
var assert = require("../../asserter.js");
var SpawnedProcess = require("../../spawned_process.js");
module.exports = queryGame;
function queryGame(gameObject) {
    var ip = gameObject.getIp();
    var port = gameObject.getPort();
    var cmdFlags = [
        "--textonly",
        "--tcpquery",
        "--nosteam",
        "--nodownlmods",
        "--ipadr", ip,
        "--port", port
    ];
    var _process = new SpawnedProcess(config.pathToDom5Exe, cmdFlags);
    return new Promise(function (resolve, reject) {
        _process.onError(function (error) { return reject(error); });
        _process.onStdoutData(function (tcpQueryResponse) {
            return verifyTcpQueryResponse(tcpQueryResponse)
                .then(function (response) { return resolve(new Dominions5TcpQuery(response)); })
                .catch(function (error) { return reject(error); });
        });
    });
}
function Dominions5TcpQuery(tcpQueryResponse) {
    assert.isStringOrThrow(tcpQueryResponse);
    var _name = parseGameName(tcpQueryResponse);
    var _status = parseStatus(tcpQueryResponse);
    var _turnNumber = parseTurnNumber(tcpQueryResponse);
    var _msLeft = parseMsLeft(tcpQueryResponse);
    var _players = parsePlayers(tcpQueryResponse);
    this.getGameName = function () { return _name; };
    this.getStatus = function () { return _status; };
    this.getTurnNumber = function () { return _turnNumber; };
    this.getMsLeft = function () { return _msLeft; };
    this.getPlayers = function () { return _players; };
}
function verifyTcpQueryResponse(tcpQueryResponse) {
    //response is not guaranteed to be valid; a wrong ip produce a response
    //with an error rather than the expected tcpquery data
    if (tcpQueryResponse.toLowerCase().includes("status:") === false) {
        return Promise.reject(new Error(tcpQueryResponse));
    }
    return Promise.resolve(tcpQueryResponse);
}
function parseGameName(tcpQueryResponse) {
    var nameLine = tcpQueryResponse.match(/Gamename:.+/i);
    var name = (nameLine != null) ? nameLine[0].replace(/Gamename:\s+/i, "").trim() : "Could not find name";
    return name;
}
function parseStatus(tcpQueryResponse) {
    var statusLine = tcpQueryResponse.match(/Status:.+/i);
    var status = (statusLine != null) ? statusLine[0].replace(/Status:\s+/i, "").trim() : "Could not find status";
    return status;
}
function parseTurnNumber(tcpQueryResponse) {
    var turnLine = tcpQueryResponse.match(/Turn:.+/i);
    var turnNumber = (turnLine != null) ? +turnLine[0].replace(/\D+/g, "") : 0;
    return turnNumber;
}
function parseMsLeft(tcpQueryResponse) {
    var msLeftLine = tcpQueryResponse.match(/Time left:.+/i);
    var msLeft = (timeLeftLine != null) ? +msLeftLine[0].replace(/\D+/g, "") : undefined;
    return msLeft;
}
function parsePlayers(tcpQueryResponse) {
    var playersLines = tcpQueryResponse.match(/player\s*\d+:.+/ig);
    var players = (playersLines != null) ? playersLines.map(function (line) { return line.replace(/player\s*\w+:/i, "").trim(); }) : undefined;
    return players;
}
//# sourceMappingURL=dominions5_tcp_query.js.map