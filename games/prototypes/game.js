
const fs = require("fs");
const fsp = require("fs").promises;
const log = require("../../logger.js");
const assert = require("../../asserter.js");
const config = require("../../config/config.json");
const GameSettings = require("./game_settings.js");
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
    this.getChannelId = () => (_discordJsChannel == null) ? null : _discordJsChannel.id;
    this.setChannel = (channel) =>
    {
        _discordJsChannel = channel;
    };

    this.deleteChannel = () =>
    {
        if (_discordJsChannel == null)
            return Promise.resolve();

        else return _discordJsChannel.delete();
    };

    this.createNewChannel = () =>
    {
        return _guildWrapper.createGameChannel(`${this.getName()}`)
        .then((channel) => 
        {
            const guildId = _guildWrapper.getId();
            const status = this.getLastKnownStatus();
            _discordJsChannel = channel

            if (status.isOngoing() === true)
            {
                log.general(log.getVerboseLevel(), `Game is ongoing; moving to started category ${guildStore.getGameCategoryId(guildId)}`);
                return channel.setParent(guildStore.getGameCategoryId(guildId));
            }
            
            else
            {
                log.general(log.getVerboseLevel(), `Game has not started; moving to open category ${guildStore.getRecruitingCategoryId(guildId)}`);
                return channel.setParent(guildStore.getRecruitingCategoryId(guildId));
            }
        });
    };

    this.getRole = () => _discordJsRole;
    this.getRoleId = () =>  (_discordJsRole == null) ? null : _discordJsRole.id;
    this.setRole = (role) =>
    {
        _discordJsRole = role;
    };

    this.deleteRole = () =>
    {
        if (_discordJsRole == null)
            return Promise.resolve();

        else return _discordJsRole.delete();
    };

    this.createNewRole = () =>
    {
        return _guildWrapper.createGameRole(`${this.getName()} Player`)
        .then((role) => _discordJsRole = role);
    };

    this.getOrganizer = () => _organizerWrapper;
    this.getOrganizerId = () => (_organizerWrapper == null) ? null : _organizerWrapper.getId();
    this.setOrganizer = (organizerWrapper) =>
    {
        _organizerWrapper = organizerWrapper;
    };

    this.getPort = () => _port;
    this.setPort = (port) => _port = port;

    this.getServer = () => _hostServer;
    this.getServerId = () => (_hostServer == null) ? null : _hostServer.getId();
    this.setServer = (hostServer) => _hostServer = hostServer;

    this.getIp = () => (_hostServer == null) ? null : _hostServer.getIp();
    
    this.isOnlineCheck = () => 
    {
        return this.emitPromiseToServer("ONLINE_CHECK", this.getPort());
    };

    this.isServerOnline = () => 
    {
        if (_hostServer == null)
            return false;

        else return _hostServer.isOnline();
    };

    this.emitPromiseToServer = (message, dataPackage) => _hostServer.emitPromise(message, dataPackage);
    this.listenToServer = (trigger, handler) => _hostServer.listenTo(trigger, handler);

    this.getDiscordGuildWrapper = () => _guildWrapper;
    this.getOrganizerMemberWrapper = () => _organizerWrapper;

    this.getSettingsObject = () => _settingsObject;

    this.setSettingsObject = (settingsObject) => 
    {
        assert.isInstanceOfPrototype(settingsObject, GameSettings);
        _settingsObject = settingsObject;
    };

    this.sendMessageToChannel = (text) => messenger.send(_discordJsChannel, text);
    this.sendGameAnnouncement = (text) => messenger.send(_discordJsChannel, `${_discordJsRole} ${text}`);

    this.pinSettingsToChannel = () =>
    {
        var settingsStringList = _settingsObject.getPublicSettingsStringList();
        var channel = this.getChannel();

        if (_discordJsChannel == null)
            return Promise.reject(new Error(`${this.getName()} does not have a channel assigned.`));

        return messenger.send(channel, settingsStringList.toBox(), { pin: true });
    };

    this.addToStore = () => ongoingGamesStore.addOngoingGame(this);

    this.save = () =>
    {
        var name = this.getName();
        var data = JSON.stringify(this, null, 2);
        var path = `${config.dataPath}/${config.gameDataFolder}`;

        log.general(log.getVerboseLevel(), `Saving data of game ${name}...`);

        return Promise.resolve()
        .then(() =>
        {
            if (fs.existsSync(`${path}/${name}`) === false)
            {
                log.general(log.getVerboseLevel(), `Directory for game data does not exist, creating it.`);
                return fsp.mkdir(`${path}/${name}`);
            }

            else return Promise.resolve();
        })
        .then(() => 
        {
            log.general(log.getVerboseLevel(), `Writing data file...`);
            return fsp.writeFile(`${path}/${name}/data.json`, data);
        })
        .then(() => 
        {
            log.general(log.getVerboseLevel(), `Data for game ${name} saved successfully.`);
        });
    };

    this.loadSettingsFromInput = (inputValues) =>
    {
        const settingsObject = this.getSettingsObject();

        return settingsObject.forEachSettingPromise((settingObject, settingKey) =>
        {
            var loadedValue = inputValues[settingKey];

            if (loadedValue == undefined)
                return Promise.reject(new SemanticError(`Expected value for setting ${settingKey} is undefined.`));

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
        assert.isStringOrThrow(jsonData.guildId);


        var guild = guildStore.getGuildWrapperById(jsonData.guildId);
        var server = hostServerStore.getHostServerById(jsonData.serverId);


        this.setGuild(guild);
        this.setServer(server);
        this.setName(jsonData.name);
        this.setPort(jsonData.port);
        

        if (assert.isString(jsonData.organizerId) === true)
            this.setOrganizer(guild.getGuildMemberWrapperById(jsonData.organizerId));

        else
        {
            log.general(log.getLeanLevel(), `${this.getName()}: organizer ${jsonData.organizerId} could not be fetched; setting guild owner ${guild.getOwner().getUsername()} instead.`);
            this.setOrganizer(guild.getOwner());
        }

        if (assert.isString(jsonData.channelId) === true)
            this.setChannel(guild.getChannelById(jsonData.channelId));

        if (assert.isString(jsonData.roleId) === true)
            this.setRole(guild.getRoleById(jsonData.roleId));


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
        jsonObject.channelId = (_discordJsChannel == null) ? null : _discordJsChannel.id;
        jsonObject.roleId = (_discordJsRole == null) ? null : _discordJsRole.id;
        return jsonObject;
    };
}