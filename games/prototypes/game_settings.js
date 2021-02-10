
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
            if (settingObject.canBeChangedAfterCreation() === true)
                fnToCallOnSettings(settingObject, key);
        });
    };

    this.forEachChangeablePublicSetting = (fnToCallOnSettings) =>
    {
        this.forEachSetting((settingObject, key) =>
        {
            if (settingObject.canBeChangedAfterCreation() === true && settingObject.isPublic() === true)
                fnToCallOnSettings(settingObject, key);
        });
    };

    this.loadJSONData = (jsonData) =>
    {
        console.log("Loading JSON data...", jsonData);
        this.forEachSetting((settingObject, settingKey) =>
        {
            var loadedValue = jsonData[settingKey];

            console.log(`Loading ${settingKey}`);

            if (loadedValue !== undefined)
                settingObject.fromJSON(loadedValue);

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
        var server = _parentGame.getServer();
        var flags = ["--tcpserver", "--ipadr", server.getIp(), "--port", _parentGame.getPort(), "--scoredump"];

        this.forEachSetting((settingObject) =>
        {
            const key = settingObject.getKey();
            const flag = settingObject.translateValueToCmdFlag();

            if (key !== "name")
                flags = flags.concat(flag);
        });

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