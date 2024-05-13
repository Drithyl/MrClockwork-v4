
const assert = require("../../asserter.js");


module.exports = DominionsEvents;

function DominionsEvents(lastKnownStatus, newStatusSnapshot)
{
    const _lastTurnNumber = lastKnownStatus.getTurnNumber();
    const _lastHour = lastKnownStatus.getHour();
    const _lastUpdateTimestamp = lastKnownStatus.getLastUpdateTimestamp();
    const _isPaused = lastKnownStatus.isPaused();

    const _currentTurnNumber = newStatusSnapshot.getTurnNumber();
    const _currentMsLeft = newStatusSnapshot.getMsLeft();
    const _currentHour = Math.floor(_currentMsLeft / 1000 / 3600);
    const _currentUpdateTimestamp = newStatusSnapshot.getLastUpdateTimestamp();
    const _currentNationData = newStatusSnapshot.getPlayers();


    this.getTurnNumber = () => _currentTurnNumber;
    this.getCurrentHour = () => _currentHour;
    this.getLastHour = () => _lastHour;
    this.getNewMsLeft = () => _currentMsLeft;

    
    this.isNewData = () => {
        if (assert.isNumber(_currentUpdateTimestamp) === false)
            return true;

        if (assert.isNumber(_lastUpdateTimestamp) === false)
            return true;

        else return _currentUpdateTimestamp > _lastUpdateTimestamp;
    };

    this.didServerGoOffline = () => {
        return  lastKnownStatus.isServerOnline() === true &&
                newStatusSnapshot.isServerOnline() === false;
    };

    this.didGameGoOffline = () => {
        return  lastKnownStatus.isOnline() === true &&
                newStatusSnapshot.isOnline() === false;
    };

    this.isServerBackOnline = () => {
        return  lastKnownStatus.isServerOnline() === false &&
                newStatusSnapshot.isServerOnline() === true;
    };

    this.isGameBackOnline = () => {
        return  lastKnownStatus.isOnline() === false &&
                newStatusSnapshot.isOnline() === true;
    };

    this.didGameStart = () => {
        return  _lastTurnNumber === -1 && _currentTurnNumber === 1;
    };

    this.didGameRestart = () => {
        return  _currentTurnNumber === -1 && _lastTurnNumber > 0;
    };

    this.areAllTurnsDone = () => {
        if (assert.isArray(_currentNationData) === false || _currentNationData.length <= 0)
            return false;

        return _currentNationData.find((nation) => nation.isTurnFinished === false && nation.isAi === false) == null;
    };

    // Check for isTurnProcessing() to make sure it's not already
    // rolling; we don't want to force it several times
    this.didTimerRunOut = () => {
        return  assert.isNumber(_currentMsLeft) === true &&
                lastKnownStatus.isTurnProcessing() !== true &&
                _currentMsLeft < 0 &&
                _isPaused !== true;
    };

    this.didHourPass = () => {
        return  assert.isNumber(_lastHour) === true &&
                assert.isNumber(_currentHour) === true &&
                _lastHour > _currentHour;
    };

    this.isLastHourBeforeTurn = () => {
        return  this.didHourPass() === true && _currentHour === 0;
    };

    this.isNewTurn = () => {
        return  assert.isNumber(_lastTurnNumber) === true &&
                assert.isNumber(_currentTurnNumber) === true &&
                _currentTurnNumber > _lastTurnNumber &&
                _currentTurnNumber > 1;
    };

    this.isTurnRollback = () => {
        return  assert.isNumber(_lastTurnNumber) === true &&
                assert.isNumber(_currentTurnNumber) === true &&
                _currentTurnNumber < _lastTurnNumber &&
                _currentTurnNumber > 0;
    };
}
