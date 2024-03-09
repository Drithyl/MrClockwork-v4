
const assert = require("../../asserter.js");

module.exports = DominionsStatusSnapshot;


function DominionsStatusSnapshot(snapshotData)
{
    // Ensure parameter is always a dictionary
    snapshotData = snapshotData ?? {};

    let _isOnline = snapshotData.isOnline ?? false;
    let _isServerOnline = snapshotData.isServerOnline ?? false;

    let _uptime = snapshotData.uptime;
    let _players = snapshotData.nationStatuses;
    let _successfulCheckTimestamp = snapshotData.successfulCheckTimestamp;
    let _lastUpdateTimestamp = snapshotData.lastUpdateTimestamp;
    let _hasStarted = snapshotData.hasStarted;
    let _turnNumber = snapshotData.turnNbr;
    let _isPaused = snapshotData.isPaused;
    let _msLeft = snapshotData.msLeft;


    this.isOnline = () => _isOnline;
    this.isServerOnline = () => _isServerOnline;
    this.getUptime = () => _uptime;
    this.getPlayers = () => _players;
    this.getSuccessfulCheckTimestamp = () => _successfulCheckTimestamp;
    this.getLastUpdateTimestamp = () => _lastUpdateTimestamp;
    this.hasStarted = () => _hasStarted;
    this.getTurnNumber = () => _turnNumber;
    this.isPaused = () => _isPaused;
    this.getMsLeft = () => _msLeft;
    this.getHour = () => Math.floor(_msLeft / 1000 / 3600);


    this.setIsOnline = (isOnline) =>
    {
        if (assert.isBoolean(isOnline) === true)
            _isOnline = isOnline;
    };

    this.setIsServerOnline = (isServerOnline) =>
    {
        if (assert.isBoolean(isServerOnline) === true)
            _isServerOnline = isServerOnline;
    };

    this.setUptime = (uptime) =>
    {
        if (assert.isInteger(uptime) === true &&
            uptime >= 0)
        {
            _uptime = uptime;
        }
    };

    this.setPlayers = (players) =>
    {
        if (assert.isArray(players) === true)
            _players = players;
    };

    this.setLastUpdateTimestamp = (timestamp) =>
    {
        if (assert.isInteger(timestamp) === true)
            _lastUpdateTimestamp = timestamp;
    };
    
    this.setSuccessfulCheckTimestamp = (timestamp) =>
    {
        if (assert.isInteger(timestamp) === true)
            _successfulCheckTimestamp = timestamp;
    };

    this.setHasStarted = (hasStarted) =>
    {
        if (assert.isBoolean(hasStarted) === true)
            _hasStarted = hasStarted;
    };

    this.setTurnNumber = (turnNumber) =>
    {
        if (assert.isInteger(turnNumber) === false)
            return;
            
        if (turnNumber === -1 || turnNumber >= 1)
            _turnNumber = turnNumber;
    };

    this.setIsPaused = (isPaused) =>
    {
        if (assert.isBoolean(isPaused) === true)
            _isPaused = isPaused;
    };

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
        {
            // Make sure if the dtimer is zero to also pause as well!
            if (msPerTurn <= 0)
                _isPaused = true;

            _msLeft = msPerTurn;
        }
    };
}
