
const assert = require("../../asserter.js");

module.exports = DominionsPreferences;

function DominionsPreferences(playerId)
{
    assert.isStringOrThrow(playerId);
    
    const _playerId = playerId;
    const _reminders = [];
    
    var _receiveScores = false;
    var _receiveBackups = false;
    var _receiveReminderWhenTurnIsDone = false;

    this.getPlayerId = () => _playerId;

    this.getReminders = () => [..._reminders];

    this.hasReminderAtHourMark = (hourMark) => _reminders.includes(hourMark);

    this.addReminderAtHourMark = (hourMark) => 
    {
        assert.isIntegerOrThrow(hourMark);
        _reminders.push(hourMark);
    };

    this.removeReminderAtHourMark = (hourMark) =>
    {
        for (var i = _reminders.length - 1; i >= 0; i--)
            if (_reminders[i] == hourMark)
                _reminders.splice(i, 1);
    };

    this.clearReminders = () => _reminders.splice(0, _reminders.length);

    this.isReceivingScores = () => _receiveScores;
    this.isReceivingBackups = () => _receiveBackups;
    this.isReceivingRemindersWhenTurnIsDone = () => _receiveReminderWhenTurnIsDone;

    this.setReceiveScores = (boolean) => 
    {
        if (assert.isBoolean(boolean) === false)
            _receiveScores = false;

        else _receiveScores = boolean;
    };

    this.setReceiveBackups = (boolean) => 
    {
        if (assert.isBoolean(boolean) === false)
            _receiveBackups = false;

        _receiveBackups = boolean;
    };

    this.setReceiveRemindersWhenTurnIsDone = (boolean) => 
    {
        if (assert.isBoolean(boolean) === false)
            _receiveReminderWhenTurnIsDone = false;

        _receiveReminderWhenTurnIsDone = boolean;
    };

    this.toJSON = () =>
    {
        return {
            playerId: _playerId,
            reminders: [..._reminders],
            receiveScores: _receiveScores,
            receiveBackups: _receiveBackups,
            receiveReminderWhenTurnIsDone: _receiveReminderWhenTurnIsDone
        };
    };
}

DominionsPreferences.loadFromJSON = (jsonData) =>
{
    const preferences = new DominionsPreferences(jsonData.playerId);

    jsonData.reminders.forEach((hourMark) => preferences.addReminderAtHourMark(hourMark));
    
    preferences.setReceiveScores(jsonData.receiveScores);
    preferences.setReceiveBackups(jsonData.receiveBackups);
    preferences.setReceiveRemindersWhenTurnIsDone(jsonData.receiveReminderWhenTurnIsDone);

    return preferences;
};