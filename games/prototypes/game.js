
const fs = require("fs");
const fsp = require("fs").promises;
const assert = require("../../asserter.js");
const GameSettings = require("./game_settings.js");
const config = require("../../config/config.json");
const messenger = require("../../discord/messenger.js");
const guildStore = require("../../discord/guild_store.js");
const ongoingGamesStore = require("../ongoing_games_store.js");
const hostServerStore = require("../../servers/host_server_store.js");

module.exports = Game;

function Game()
{
    var _hostServer;
    var _port;
    var _guildWrapper;
    var _organizerWrapper;
    var _settingsObject;
    var _discordJsChannel;
    var _discordJsRole;

    this.getName = () => 
    {
        const settings = this.getSettingsObject();
        const nameSetting = settings.getNameSetting();

        return nameSetting.getValue();
    };

    this.setName = (name) =>
    {
        const settings = this.getSettingsObject();
        const nameSetting = settings.getNameSetting();

        return nameSetting.setValue(name);
    };

    this.getGuild = () => _guildWrapper;
    this.getGuildId = () => _guildWrapper.getId();
    this.setGuild = (guildWrapper) =>
    {
        _guildWrapper = guildWrapper;
    };

    this.getChannel = () => _discordJsChannel;
    this.getChannelId = () => _discordJsChannel.id;
    this.setChannel = (channel) =>
    {
        _discordJsChannel = channel;
    };

    this.createNewChannel = () =>
    {
        return _guildWrapper.createGameChannel(`${this.getName()}`)
        .then((channel) => _discordJsChannel = channel);
    };

    this.getRole = () => _discordJsRole;
    this.getRoleId = () => _discordJsRole.id;
    this.setRole = (role) =>
    {
        _discordJsRole = role;
    };

    this.createNewRole = () =>
    {
        return _guildWrapper.createGameRole(`${this.getName()} Player`)
        .then((role) => _discordJsRole = role);
    };

    this.getOrganizerId = () => _organizerWrapper.getId();
    this.setOrganizer = (organizerWrapper) =>
    {
        _organizerWrapper = organizerWrapper;
    };

    this.getPort = () => _port;
    this.setPort = (port) => _port = port;

    this.getServer = () => _hostServer;
    this.getServerId = () => _hostServer.getId();
    this.setServer = (hostServer) => _hostServer = hostServer;

    this.getIp = () => _hostServer.getIp();
    
    this.isOnlineCheck = () => 
    {
        return this.emitPromiseToHostServer("ONLINE_CHECK", this.getPort());
    };

    this.isServerOnline = () => 
    {
        if (_hostServer == null)
            return false;

        else return _hostServer.isOnline();
    };

    this.emitPromiseToServerSuper = (message, dataPackage) => _hostServer.emitPromise(message, dataPackage);
    this.listenToServer = (trigger, handler) => _hostServer.listenTo(trigger, handler);

    this.getDiscordGuildWrapper = () => _guildWrapper;
    this.getOrganizerMemberWrapper = () => _organizerWrapper;

    this.getSettingsObject = () => _settingsObject;

    this.setSettingsObject = (settingsObject) => 
    {
        assert.isInstanceOfPrototype(settingsObject, GameSettings);
        _settingsObject = settingsObject;
    };

    this.sendMessageToDiscordChannel = (text) => messenger.send(_discordJsChannel, text);
    this.sendGameAnnouncement = (text) => messenger.send(_discordJsChannel, `${_discordJsRole} ${text}`);

    this.pinSettingsToChannel = () =>
    {
        var settingsStringList = _settingsObject.getPublicSettingsStringList();
        var channel = this.getChannel();

        if (_discordJsChannel == null)
            return Promise.reject(new Error(`${this.getName()} does not have a channel assigned.`));

        return messenger.send(channel, settingsStringList.toBox(), { pin: true });
    };

    this.finishGameCreation = () =>
    {
        ongoingGamesStore.addOngoingGame(this);
        return this.save()
        .then(() => console.log(`Game ${this.getName()} was created successfully.`));
    };

    this.save = () =>
    {
        var name = this.getName();
        var data = JSON.stringify(this, null, 2);
        var path = config.pathToGameData;

        console.log(`Saving data of game ${name}...`);

        return Promise.resolve()
        .then(() =>
        {
            if (fs.existsSync(`${path}/${name}`) === false)
            {
                console.log(`Directory for game data does not exist, creating it.`);
                return fsp.mkdir(`${path}/${name}`);
            }

            else return Promise.resolve();
        })
        .then(() => 
        {
            console.log(`Writing data file...`);
            return fsp.writeFile(`${path}/${name}/data.json`, data);
        })
        .then(() => console.log(`Data for game ${name} saved successfully.`));
    };

    this.loadSettingsFromInput = (inputValues) =>
    {
        const settingsObject = this.getSettingsObject();

        return settingsObject.forEachSettingObjectPromise((settingObject, settingKey) =>
        {
            var loadedValue = inputValues[settingKey];

            if (loadedValue !== undefined)
                return settingObject.setValue(loadedValue);
        });
    };

    this.loadJSONDataSuper = (jsonData) =>
    {
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

        this.setGuild(guild);
        this.setOrganizer(organizer);
        this.setChannel(channel);
        this.setRole(role);
        this.setName(jsonData.name);
        this.setPort(jsonData.port);
        this.setServer(server);

        _settingsObject.loadJSONData(jsonData.settings);

        return this;
    };

    this.toJSONSuper = () =>
    {
        var jsonObject = {};
        jsonObject.name = this.getName();
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