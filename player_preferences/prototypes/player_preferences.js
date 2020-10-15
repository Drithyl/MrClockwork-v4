
const assert = require("../../asserter.js");
const rw = require("../../reader_writer.js");

export { loadAll, revivePlayerPreferencesFromJSON, PlayerPreferences }

function loadAll()
{
    var revivedData = [];
    var dirPath = config.pathToPlayerGamePreferences;
    var dirContents = rw.readDirContentsSync(dirPath);

    dirContents.forEach((stringData) =>
    {
        var parsedJSON = JSON.parse(stringData);
        var revivedJSON = revivePlayerPreferencesFromJSON(parsedJSON);
        revivedData.push(revivedJSON);
    });

    return revivedData;
};

function revivePlayerPreferencesFromJSON(jsonData)
{
    assert.isObjectOrThrow(jsonData);
    assert.isArrayOrThrow(jsonData.reminders);

    var preferences = new PlayerPreferences(jsonData.playerId);

    for (var i = 0; i < jsonData.reminders.length; i++)
    {
        var reminderHourMark = jsonData.reminders[i];
        preferences.addReminderAtHourMark(reminderHourMark);
    }

    preferences.setReceiveScores(jsonData.receiveScores);
    preferences.setReceiveBackups(jsonData.receiveBackups);
    preferences.setReceiveRemindersWhenTurnIsDone(jsonData.receiveReminderWhenTurnIsDone);

    return preferences;
}

function PlayerPreferences(playerId)
{
    assert.isStringOrThrow(playerId);
    
    const _playerId = playerId;
    const _reminders = [];
    const _receiveScores = false;
    const _receiveBackups = false;
    const _receiveReminderWhenTurnIsDone = false;

    this.getPlayerId = () => _playerId;

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

    this.isReceivingScores = () => _receiveScores;
    this.isReceivingBackups = () => _receiveBackups;
    this.isReceivingRemindersWhenTurnIsDone = () => _receiveReminderWhenTurnIsDone;

    this.setReceiveScores = (boolean) => 
    {
        assert.isBooleanOrThrow(boolean);
        _receiveScores = boolean;
    };

    this.setReceiveBackups = (boolean) => 
    {
        assert.isBooleanOrThrow(boolean);
        _receiveScores = boolean;
    };

    this.setReceiveRemindersWhenTurnIsDone = (boolean) => 
    {
        assert.isBooleanOrThrow(boolean);
        _receiveScores = boolean;
    };

    this.save = () =>
    {
        var path = `${config.pathToGlobalPreferences}/${_playerId}.json`;
        var dataToSave = this.toJSON();

        return rw.saveJSON(path, dataToSave)
        .catch((err) => 
        {
            rw.log("error", `Could not save player's ${_playerId} global preferences: ${err.message}`);
            return Promise.resolve();
        });
    };

    this.toJSON()
    {
        return {
            playerId: _preferences.getPlayerId(),
            reminders: [..._reminders],
            receiveScores: _receiveScores,
            receiveBackups: _receiveBackups,
            receiveReminderWhenTurnIsDone: _receiveReminderWhenTurnIsDone
        };
    }
}