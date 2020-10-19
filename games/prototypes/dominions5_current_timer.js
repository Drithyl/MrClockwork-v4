
//TODO: Might not be needed!

const assert = require("../../asserter.js");
const TimeLeft = require("./time_left.js");
const queryDominions5Game = require("./dominions5_tcp_query.js");
const TimerSetting = require("../../game_settings/dom5/prototypes/timer.js");

module.exports = Dominions5CurrentTimer;

function Dominions5CurrentTimer()
{
    var _lastKnownTurnNumber = 0;
    var _lastKnownMsLeftForNewTurn = 0;
    var _lastCheckDateInMs = 0;
    var _timerSettingObject;
    var _newTurnHandler = function(){};
    var _newHourHandler = function(){};
    var _lastHourHandler = function(){};

    this.getLastKnownMsLeft = () => _lastKnownMsLeftForNewTurn;
    this.getLastKnownTurnNumber = () => _lastKnownTurnNumber;
    this.getDefaultTimerInMs = () => _timerSettingObject.getValue();

    this.setDefaultTimer = (timerSettingObject) =>
    {
        assert.isInstanceOfPrototype(timerSettingObject, TimerSetting);
        _timerSettingObject = timerSettingObject;
    };

    this.setToDefault = () => _msLeft = _timerSettingObject.getValue();

    this.setNewTurnHandler = (handler) =>
    {
        assert.isFunctionOrThrow(handler);
        _newTurnHandler = handler;
    };
    
    this.setNewHourHandler = (handler) =>
    {
        assert.isFunctionOrThrow(handler);
        _newHourHandler = handler;
    };
    
    this.setLastHourHandler = (handler) =>
    {
        assert.isFunctionOrThrow(handler);
        _lastHourHandler = handler;
    };

    this.updateTimer = () =>
    {
        return queryDominions5Game(_gameObject)
        .then((tcpQueryResponse) =>
        {
            const storedLastKnownTurnNumber = _lastKnownTurnNumber;
            const storedLastKnownMsLeftForNewTurn = _lastKnownMsLeftForNewTurn;
            const updatedMs = tcpQueryResponse.getMsLeft();
            const updatedTurnNumber = tcpQueryResponse.getCurrentTurnNumber();

            _lastKnownMsLeftForNewTurn = updatedMs;
            _lastKnownTurnNumber = updatedTurnNumber;
            _lastCheckDateInMs = Date.now();

            if (isNewTurn(storedLastKnownTurnNumber, updatedTurnNumber) === true)
                return _newTurnHandler(updatedMs, updatedTurnNumber);

            else if (isLastHour(storedLastKnownMsLeftForNewTurn, updatedMs) === true)
                return _lastHourHandler(updatedMs);

            else if (anHourWentBy(storedLastKnownMsLeftForNewTurn, updatedMs) === true)
                return _newHourHandler(updatedMs);
        });
    };

    this.printTimeLeft = () =>
    {
        const lastKnownTimeLeft = new TimeLeft(_lastKnownMsLeftForNewTurn);
        const lastCheck = new TimeLeft(_lastCheckDateInMs);

        return commandContext.respondToCommand(`It is turn ${_lastKnownTurnNumber}. There are ${lastKnownTimeLeft.printTimeLeft()} (last checked ${lastCheck.printTimeLeftShort()} ago).`);
    };

    this.printDefaultTimer = () =>
    {
        const defaultTimer = new TimeLeft(_timerSettingObject.getValue());

        return commandContext.respondToCommand(`The default timer is ${defaultTimer.printTimeLeft}.`);
    };

    this.printTimeLeftShort = () =>
    {
        const lastKnownTimeLeft = new TimeLeft(_lastKnownMsLeftForNewTurn);
        
        return commandContext.respondToCommand(lastKnownTimeLeft.printTimeLeftShort());
    };
}

function isNewTurn(lastKnownTurnNumber, updatedTurnNumber)
{
    return lastKnownTurnNumber < updatedTurnNumber;
}

function isLastHour(lastKnownMsLeft, updatedMsLeft)
{
    return lastKnownMsLeft > 3600000 && updatedMsLeft <= 3600000;
}

function anHourWentBy(lastKnownMsLeft, updatedMsLeft)
{
    return Math.floor(lastKnownMsLeft / 3600000) > Math.floor(updatedMsLeft / 3600000);
}