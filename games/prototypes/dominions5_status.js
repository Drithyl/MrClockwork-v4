
const assert = require("../../asserter.js");
const TimeLeft = require("./time_left.js");
const Dominions5StatusSnapshot = require("./dominions5_status_snapshot.js");


module.exports = Dominions5Status;


function Dominions5Status()
{
    const _statusSnapshot = new Dominions5StatusSnapshot();

    var _lastTurnTimestamp;
    var _isTurnProcessing = false;
    var _isCurrentTurnRollback = false;
    var _turnStartProcessingTimestamp;


    _statusSnapshot.getLastTurnTimestamp = () => _lastTurnTimestamp; 
    _statusSnapshot.setLastTurnTimestamp = (timestamp) =>
    {
        if (assert.isInteger(timestamp) === true)
            _lastTurnTimestamp = timestamp;
    };

    _statusSnapshot.getTurnStartProcessingTimestamp = () => _turnStartProcessingTimestamp;

    _statusSnapshot.isTurnProcessing = () => _isTurnProcessing;
    _statusSnapshot.setIsTurnProcessing = (isTurnProcessing) =>
    {
        if (assert.isBoolean(isTurnProcessing) === true)
        {
            _isTurnProcessing = isTurnProcessing;

            if (_isTurnProcessing === true)
                _turnStartProcessingTimestamp = Date.now();
        }
    };

    _statusSnapshot.isCurrentTurnRollback = () => _isCurrentTurnRollback;
    _statusSnapshot.setIsCurrentTurnRollback = (isCurrentTurnRollback) =>
    {
        if (assert.isBoolean(isCurrentTurnRollback) === true)
            _isCurrentTurnRollback = isCurrentTurnRollback;
    };

    _statusSnapshot.getStatusString = () =>
    {
        if (_statusSnapshot.isServerOnline() === false)
            return `Server offline`;

        else if (_statusSnapshot.isOnline() === false)
            return `Game offline`;

        else if (_statusSnapshot.hasStarted() === true)
            return `Game active`;

        else return `Waiting for pretenders`;
    };

    _statusSnapshot.areAllTurnsDone = () =>
    {
        const players = _statusSnapshot.getPlayers();

        if (assert.isArray(players) === false || players.length <= 0)
            return false;

        return players.find((player) => player.isTurnFinished === false && player.isAi === false) == null;
    };

    // Turns which have never been opened by their player
    _statusSnapshot.getUncheckedTurns = () =>
    {
        const players = _statusSnapshot.getPlayers();

        if (assert.isArray(players) === false)
            return null;

        const uncheckedNations = players.filter((nationData) => {
            return nationData.isHuman === true && nationData.wasTurnChecked === false
        });

        return uncheckedNations.map((nation) => nation.fullName);
    };

    // Turns which have not been marked as unfinished (done, but not finished)
    _statusSnapshot.getUnfinishedTurns = () =>
    {
        const players = _statusSnapshot.getPlayers();

        if (assert.isArray(players) === false)
            return null;

        const unfinishedNations = players.filter((nationData) => {
            return nationData.isHuman === true && nationData.isTurnUnfinished === true && nationData.isTurnFinished === false
        });

        return unfinishedNations.map((nation) => nation.fullName);
    };

    // Turns which have not been marked as finished (can be unchecked or unfinished)
    _statusSnapshot.getUndoneTurns = () =>
    {
        const players = _statusSnapshot.getPlayers();

        if (assert.isArray(players) === false)
            return null;

        const undoneNations = players.filter((nationData) => {
            return nationData.isHuman === true &&  nationData.isTurnFinished === false
        });

        return undoneNations.map((nation) => nation.fullName);
    };

    _statusSnapshot.getTimeLeft = () =>
    {
        const msLeft = _statusSnapshot.getMsLeft();

        if (msLeft == null)
            return null;

        return new TimeLeft(msLeft);
    };

    _statusSnapshot.printTimeLeft = () =>
    {
        const msLeft = _statusSnapshot.getMsLeft();
        const timeLeft = new TimeLeft(msLeft);
        var offlineStr = "";

        if (_statusSnapshot.isOnline() === false)
            offlineStr = " **(game is offline)**";

        if (_statusSnapshot.isPaused() === true)
            return `${timeLeft.printTimeLeft()} **(paused)**` + offlineStr;

        // Less than 1 second
        if (timeLeft.getMsLeft() <= 999)
            return `The new turn should be processing shortly. Otherwise, you can !forcehost it`;

        return `**${timeLeft.printTimeLeft()}**` + offlineStr;
    };

    _statusSnapshot.toJSON = () =>
    {
        const jsonData = {
            isCurrentTurnRollback: _isCurrentTurnRollback,
            lastTurnTimestamp: _lastTurnTimestamp,

            hasStarted: _statusSnapshot.hasStarted(),
            isPaused: _statusSnapshot.isPaused(),
            turnNumber: _statusSnapshot.getTurnNumber(),
            msLeft: _statusSnapshot.getMsLeft(),
            players: _statusSnapshot.getPlayers(),
            lastUpdateTimestamp: _statusSnapshot.getLastUpdateTimestamp(),
            successfulCheckTimestamp: _statusSnapshot.getSuccessfulCheckTimestamp()
        };

        return jsonData;
    };

    _statusSnapshot.fromJSON = (data) =>
    {
        _statusSnapshot.setIsCurrentTurnRollback(data.isCurrentTurnRollback);
        _statusSnapshot.setLastTurnTimestamp(data.lastTurnTimestamp);

        _statusSnapshot.setHasStarted(data.hasStarted);
        _statusSnapshot.setIsPaused(data.isPaused);
        _statusSnapshot.setTurnNumber(data.turnNumber);
        _statusSnapshot.setMsLeft(data.msLeft);
        _statusSnapshot.setPlayers(data.players);
        _statusSnapshot.setLastUpdateTimestamp(data.lastUpdateTimestamp);
        _statusSnapshot.setSuccessfulCheckTimestamp(data.successfulCheckTimestamp);
    };

    return _statusSnapshot;
}