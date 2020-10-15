"use strict";
var assert = require("../../asserter.js");
module.exports = GameSettings;
function GameSettings(parentGame) {
    var _this = this;
    var _settingObjectsArray = [];
    var _parentGame = parentGame;
    this.addSettingObjects = function () {
        var settingObjects = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            settingObjects[_i] = arguments[_i];
        }
        settingObjects.forEach(function (settingObject) {
            validateSettingObjectOrThrow(settingObject);
            _settingObjectsArray.push(settingObject);
        });
    };
    this.forEachSettingObject = function (doSomething) {
        _settingObjectsArray.forEach(function (settingObject) {
            doSomething(settingObject, settingObject.getKey());
        });
    };
    this.forEachSettingObjectPromise = function (doSomething) {
        return _settingObjectsArray.forEachPromise(function (settingObject, index, nextPromise) {
            return Promise.resolve(doSomething(settingObject, settingObject.getKey()))
                .then(function () { return nextPromise(); });
        });
    };
    this.loadJSONData = function (jsonData) {
        console.log("Loading JSON data...", jsonData);
        _this.forEachSettingObject(function (settingObject, settingKey) {
            var loadedValue = jsonData[settingKey];
            console.log("Loading " + settingKey);
            if (loadedValue !== undefined)
                settingObject.fromJSON(loadedValue);
            else
                console.log(settingKey + " is undefined.");
        });
    };
    this.getSettingFlags = function () {
        var server = _parentGame.getServer();
        var flags = ["--tcpserver", "--ipadr", server.getIp(), "--port", _parentGame.getPort()];
        _this.forEachSettingObject(function (settingObject) {
            var flag = settingObject.translateValueToCmdFlag();
            flags = flags.concat(flag);
        });
        return flags;
    };
    this.getSettingsStringList = function () {
        var stringList = "";
        _this.forEachSettingObject(function (settingObject, settingKey) {
            var name = settingObject.getName();
            var readableValue = settingObject.getReadableValue();
            stringList += name + ": " + readableValue + "\n";
        });
        return stringList;
    };
    this.getPublicSettingsStringList = function () {
        var stringList = "";
        _this.forEachSettingObject(function (settingObject, settingKey) {
            if (settingKey !== "masterPassword") {
                var name = settingObject.getName();
                var readableValue = settingObject.getReadableValue();
                stringList += name + ": " + readableValue + "\n";
            }
        });
        return stringList;
    };
    this.toJSON = function () {
        var jsonData = {};
        _this.forEachSettingObject(function (settingObject, settingKey) {
            jsonData[settingKey] = settingObject.getValue();
        });
        return jsonData;
    };
}
function validateSettingObjectOrThrow(settingObject) {
    assert.isFunctionOrThrow(settingObject.setValue);
    assert.isFunctionOrThrow(settingObject.getValue);
    assert.isFunctionOrThrow(settingObject.getKey);
    assert.isFunctionOrThrow(settingObject.getName);
    assert.isFunctionOrThrow(settingObject.getPrompt);
    assert.isFunctionOrThrow(settingObject.translateValueToCmdFlag);
}
;
//# sourceMappingURL=game_settings.js.map