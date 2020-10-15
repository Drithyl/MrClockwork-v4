"use strict";
var fs = require("fs");
var fsp = require("fs").promises;
var assert = require("../../asserter.js");
var GameSettings = require("./game_settings.js");
var config = require("../../config/config.json");
var messenger = require("../../discord/messenger.js");
var guildStore = require("../../discord/guild_store.js");
var ongoingGamesStore = require("../ongoing_games_store.js");
var hostServerStore = require("../../servers/host_server_store.js");
module.exports = Game;
function Game() {
    var _this = this;
    var _hostServer;
    var _port;
    var _guildWrapper;
    var _organizerWrapper;
    var _settingsObject;
    var _discordJsChannel;
    var _discordJsRole;
    this.getName = function () {
        var settings = _this.getSettingsObject();
        var nameSetting = settings.getNameSetting();
        return nameSetting.getValue();
    };
    this.setName = function (name) {
        var settings = _this.getSettingsObject();
        var nameSetting = settings.getNameSetting();
        return nameSetting.setValue(name);
    };
    this.getGuild = function () { return _guildWrapper; };
    this.getGuildId = function () { return _guildWrapper.getId(); };
    this.setGuild = function (guildWrapper) {
        _guildWrapper = guildWrapper;
    };
    this.getChannel = function () { return _discordJsChannel; };
    this.getChannelId = function () { return _discordJsChannel.id; };
    this.setChannel = function (channel) {
        _discordJsChannel = channel;
    };
    this.createNewChannel = function () {
        return _guildWrapper.createGameChannel("" + _this.getName())
            .then(function (channel) { return _discordJsChannel = channel; });
    };
    this.getRole = function () { return _discordJsRole; };
    this.getRoleId = function () { return _discordJsRole.id; };
    this.setRole = function (role) {
        _discordJsRole = role;
    };
    this.createNewRole = function () {
        return _guildWrapper.createGameRole(_this.getName() + " Player")
            .then(function (role) { return _discordJsRole = role; });
    };
    this.getOrganizerId = function () { return _organizerWrapper.getId(); };
    this.setOrganizer = function (organizerWrapper) {
        _organizerWrapper = organizerWrapper;
    };
    this.getPort = function () { return _port; };
    this.setPort = function (port) { return _port = port; };
    this.getServer = function () { return _hostServer; };
    this.getServerId = function () { return _hostServer.getId(); };
    this.setServer = function (hostServer) { return _hostServer = hostServer; };
    this.getIp = function () { return _hostServer.getIp(); };
    this.isOnlineCheck = function () {
        return _this.emitPromiseToHostServer("ONLINE_CHECK", _this.getPort());
    };
    this.isServerOnline = function () {
        if (_hostServer == null)
            return false;
        else
            return _hostServer.isOnline();
    };
    this.emitPromiseToHostServer = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _hostServer.emitPromise.apply(_hostServer, args);
    };
    this.listenToMessageFromHostServer = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _hostServer.listenTo.apply(_hostServer, args);
    };
    this.getDiscordGuildWrapper = function () { return _guildWrapper; };
    this.getOrganizerMemberWrapper = function () { return _organizerWrapper; };
    this.getSettingsObject = function () { return _settingsObject; };
    this.setSettingsObject = function (settingsObject) {
        assert.isInstanceOfPrototype(settingsObject, GameSettings);
        _settingsObject = settingsObject;
    };
    this.sendMessageToDiscordChannel = function (text) { return messenger.send(_discordJsChannel, text); };
    this.sendGameAnnouncement = function (text) { return messenger.send(_discordJsChannel, _discordJsRole + " " + text); };
    this.pinSettingsToChannel = function () {
        var settingsStringList = _settingsObject.getPublicSettingsStringList();
        var channel = _this.getChannel();
        if (_discordJsChannel == null)
            return Promise.reject(new Error(_this.getName() + " does not have a channel assigned."));
        return messenger.send(channel, settingsStringList.toBox(), { pin: true });
    };
    this.finishGameCreation = function () {
        ongoingGamesStore.addOngoingGame(_this);
        return _this.save()
            .then(function () { return console.log("Game " + _this.getName() + " was created successfully."); });
    };
    this.save = function () {
        var name = _this.getName();
        var data = JSON.stringify(_this, null, 2);
        var path = config.pathToGameData;
        console.log("Saving data of game " + name + "...");
        return Promise.resolve()
            .then(function () {
            if (fs.existsSync(path + "/" + name) === false) {
                console.log("Directory for game data does not exist, creating it.");
                return fsp.mkdir(path + "/" + name);
            }
            else
                return Promise.resolve();
        })
            .then(function () {
            console.log("Writing data file...");
            return fsp.writeFile(path + "/" + name + "/data.json", data);
        })
            .then(function () { return console.log("Data for game " + name + " saved successfully."); });
    };
    this.loadSettingsFromInput = function (inputValues) {
        var settingsObject = _this.getSettingsObject();
        return settingsObject.forEachSettingObjectPromise(function (settingObject, settingKey) {
            var loadedValue = inputValues[settingKey];
            if (loadedValue !== undefined)
                return settingObject.setValue(loadedValue);
        });
    };
    this.loadJSONData = function (jsonData) {
        assert.isObjectOrThrow(jsonData);
        assert.isObjectOrThrow(jsonData.settings);
        assert.isStringOrThrow(jsonData.name);
        assert.isIntegerOrThrow(jsonData.port);
        assert.isStringOrThrow(jsonData.serverId);
        assert.isStringOrThrow(jsonData.organizerId);
        assert.isStringOrThrow(jsonData.guildId);
        assert.isStringOrThrow(jsonData.channelId);
        assert.isStringOrThrow(jsonData.roleId);
        var guild = guildStore.getGuildWrapperById(jsonData.guildId);
        var organizer = guild.getGuildMemberWrapperById(jsonData.organizerId);
        var channel = guild.getChannelById(jsonData.channelId);
        var role = guild.getRoleById(jsonData.roleId);
        var server = hostServerStore.getHostServerById(jsonData.serverId);
        _this.setGuild(guild);
        _this.setOrganizer(organizer);
        _this.setChannel(channel);
        _this.setRole(role);
        _this.setName(jsonData.name);
        _this.setPort(jsonData.port);
        _this.setServer(server);
        _settingsObject.loadJSONData(jsonData.settings);
        return _this;
    };
    this.toJSON = function () {
        var jsonObject = {};
        jsonObject.name = _this.getName();
        jsonObject.port = _port;
        jsonObject.serverId = (_hostServer != null) ? _hostServer.getId() : _serverId;
        jsonObject.settings = _settingsObject.toJSON();
        jsonObject.organizerId = _organizerWrapper.getId();
        jsonObject.guildId = _guildWrapper.getId();
        jsonObject.channelId = _discordJsChannel.id;
        jsonObject.roleId = _discordJsRole.id;
        return jsonObject;
    };
}
//# sourceMappingURL=game.js.map