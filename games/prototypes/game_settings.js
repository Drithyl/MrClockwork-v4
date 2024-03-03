
const log = require("../../logger.js");
const assert = require("../../asserter.js");

module.exports = GameSettings;

function GameSettings(parentGame)
{
    const _settingObjectsArray = [];
    const _parentGame = parentGame;

    this.addSettingObjects = (...settingObjects) =>
    {
        settingObjects.forEach((settingObject) =>
        {
            validateSettingObjectOrThrow(settingObject);
            _settingObjectsArray.push(settingObject);
        });
    };

    this.getPublicSettings = () => _settingObjectsArray.filter((setting) => setting.isPublic());
    this.getChangeableSettings = () => _settingObjectsArray.filter((setting) => setting.canBeChanged());

    this.forEachSetting = (fnToCallOnSettings) =>
    {
        _settingObjectsArray.forEach((settingObject) => fnToCallOnSettings(settingObject, settingObject.getKey()));
    };

    this.forEachSettingPromise = (fnToCallOnSettings) =>
    {
        return _settingObjectsArray.forEachPromise((settingObject, index, nextPromise) =>
        {
            return Promise.resolve(fnToCallOnSettings(settingObject, settingObject.getKey()))
            .then(() => nextPromise())
            .catch((err) => Promise.reject(err));
        });
    };

    this.forEachPublicSetting = (fnToCallOnSettings) =>
    {
        this.forEachSetting((settingObject, key) =>
        {
            if (settingObject.isPublic() === true)
                fnToCallOnSettings(settingObject, key);
        });
    };

    this.forEachChangeableSetting = (fnToCallOnSettings) =>
    {
        this.forEachSetting((settingObject, key) =>
        {
            if (settingObject.canBeChanged() === true)
                fnToCallOnSettings(settingObject, key);
        });
    };

    this.forEachChangeablePublicSetting = (fnToCallOnSettings) =>
    {
        this.forEachSetting((settingObject, key) =>
        {
            if (settingObject.canBeChanged() === true && settingObject.isPublic() === true)
                fnToCallOnSettings(settingObject, key);
        });
    };

    this.loadJSONData = (jsonData, needsPatching = false) =>
    {
        log.general(log.getNormalLevel(), "Loading JSON data...", jsonData);
        this.forEachSetting((settingObject, settingKey) =>
        {
            var loadedValue = jsonData[settingKey];

            log.general(log.getNormalLevel(), `Loading ${settingKey}`);

            if (loadedValue !== undefined)
                settingObject.fromJSON(loadedValue, needsPatching);

            else throw new Error(`${settingKey} is undefined.`);
        });
    };

    this.getSettingByKey = (keyToMatch) =>
    {
        var setting;

        this.forEachSetting((settingObject, settingKey) =>
        {
            if (keyToMatch.toLowerCase() === settingKey.toLowerCase())
                setting = settingObject;
        });

        return setting;
    };

    this.getSettingFlags = () =>
    {
        var flags = ["--tcpserver", "--port", _parentGame.getPort(), "--scoredump", "--renaming", "--noclientstart"];

        this.forEachSetting((settingObject) =>
        {
            const key = settingObject.getKey();
            const flag = settingObject.translateValueToCmdFlag();

            if (key !== "name" && key !== "timer")
                flags = flags.concat(flag);
        });

        // Add name at the very start of the flags
        flags.push(_parentGame.getName());

        return flags;
    };

    this.getSettingsStringList = () =>
    {
        var stringList = "";

        this.forEachSetting((settingObject, settingKey) =>
        {
            var name = settingObject.getName();
            var readableValue = settingObject.getReadableValue();
            stringList += `${name}: ${readableValue}\n`;
        });

        return stringList;
    };

    this.getPublicSettingsStringList = () =>
    {
        var stringList = "";

        this.forEachPublicSetting((settingObject, settingKey) =>
        {
            var name = settingObject.getName();
            var readableValue = settingObject.getReadableValue();
            stringList += `${name}: ${readableValue}\n`;
        });

        return stringList;
    };

    this.toJSON = () =>
    {
        var jsonData = {};

        this.forEachSetting((settingObject, settingKey) =>
        {
            jsonData[settingKey] = settingObject.getValue();
        });

        return jsonData;
    };
}

function validateSettingObjectOrThrow(settingObject)
{
    assert.isFunctionOrThrow(settingObject.setValue);
    assert.isFunctionOrThrow(settingObject.getValue);
    assert.isFunctionOrThrow(settingObject.getKey);
    assert.isFunctionOrThrow(settingObject.getName);
    assert.isFunctionOrThrow(settingObject.getPrompt);
    assert.isFunctionOrThrow(settingObject.translateValueToCmdFlag);
}