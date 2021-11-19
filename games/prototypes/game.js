
const fs = require("fs");
const fsp = require("fs").promises;
const log = require("../../logger.js");
const assert = require("../../asserter.js");
const config = require("../../config/config.json");
const GameSettings = require("./game_settings.js");
const guildStore = require("../../discord/guild_store.js");
const ongoingGamesStore = require("../ongoing_games_store.js");
const hostServerStore = require("../../servers/host_server_store.js");
const SemanticError = require("../../errors/custom_errors.js").SemanticError;
const MessagePayload = require("../../discord/prototypes/message_payload.js");

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
    var _roleId;
    var _guildId;
    var _channelId;

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
    this.getGuildId = () => _guildId;
    this.setGuild = (guildWrapper) =>
    {
        if (assert.isObject(guildWrapper) === true && assert.isString(guildWrapper.getId()) === true)
        {
            _guildWrapper = guildWrapper;
            _guildId = guildWrapper.getId();
        }
    };

    this.getChannel = () => _discordJsChannel;
    this.getChannelId = () => _channelId;
    this.setChannel = (channel) =>
    {
        if (assert.isObject(channel) === true && assert.isString(channel.id) === true)
        {
            _discordJsChannel = channel;
            _channelId = channel.id;
        }
    };

    this.deleteChannel = () =>
    {
        _channelId = null;

        if (_discordJsChannel == null)
            return Promise.resolve();

        return _discordJsChannel.delete();
    };

    this.createNewChannel = () =>
    {
        return _guildWrapper.createGameChannel(`${this.getName()}`, [
            { 
                id: this.getOrganizerId(), 
                allow: [ "MANAGE_MESSAGES" ]
            }
        ])
        .then((channel) => 
        {
            const guildId = _guildWrapper.getId();
            const status = this.getLastKnownStatus();
            
            this.setChannel(channel);

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
    this.getRoleId = () =>  _roleId;
    this.setRole = (role) =>
    {
        if (assert.isObject(role) === true && assert.isString(role.id) === true)
        {
            _discordJsRole = role;
            _roleId = role.id;
        }
    };

    this.deleteRole = () =>
    {
        _roleId = null;

        if (_discordJsRole == null)
            return Promise.resolve();

        return _discordJsRole.delete();
    };

    this.createNewRole = () =>
    {
        return _guildWrapper.createGameRole(`${this.getName()} Player`)
        .then((role) => this.setRole(role));
    };

    this.getOrganizer = () => _organizerWrapper;
    this.getOrganizerId = () => (_organizerWrapper == null) ? null : _organizerWrapper.getId();
    this.setOrganizer = (organizerWrapper) =>
    {
        assert.isObjectOrThrow(organizerWrapper);
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

    this.sendMessageToChannel = (text) => new MessagePayload(text).send(_discordJsChannel);
    this.sendGameAnnouncement = (text) => new MessagePayload(`${_discordJsRole.toString()} ${text}`).send(_discordJsChannel);
    this.sendMessageToOrganizer = (text) => 
    {
        if (_organizerWrapper != null)
            return _organizerWrapper.sendMessage(new MessagePayload(text));
            
        else return Promise.resolve();
    };

    this.pinSettingsToChannel = () =>
    {
        var addressString = `IP: ${this.getIp()}:${this.getPort()}\n`;
        var settingsStringList = _settingsObject.getPublicSettingsStringList();
        var channel = this.getChannel();
        const payload = new MessagePayload((addressString + settingsStringList).toBox());

        if (_discordJsChannel == null)
            return Promise.reject(new Error(`${this.getName()} does not have a channel assigned.`));

        return payload.send(channel, { pin: true });
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

        if (guild == null)
            return Promise.reject(new Error(`Guild with id ${jsonData.guildId} cannot be found; skipping game ${jsonData.name}`));


        this.setGuild(guild);
        this.setServer(server);
        this.setName(jsonData.name);
        this.setPort(jsonData.port);

        return guild.fetchGuildMemberWrapperById(jsonData.organizerId)
        .catch((err) =>
        {
            log.general(log.getLeanLevel(), `${this.getName()}: organizer ${jsonData.organizerId} could not be fetched; setting guild owner instead.`);
            return guild.fetchOwner();
        })
        .then((organizerWrapper) =>
        {
            this.setOrganizer(organizerWrapper);

            if (assert.isString(jsonData.channelId) === true)
                this.setChannel(guild.getChannelById(jsonData.channelId));

            if (assert.isString(jsonData.roleId) === true)
                this.setRole(guild.getRoleById(jsonData.roleId));


            _settingsObject.loadJSONData(jsonData.settings, jsonData.needsPatching);

            return this;
        });
    };

    this.toJSONSuper = () =>
    {
        var jsonObject = {};
        jsonObject.name = this.getName();
        jsonObject.port = _port;
        jsonObject.serverId = (_hostServer != null) ? _hostServer.getId() : _serverId;
        jsonObject.settings = _settingsObject.toJSON();
        jsonObject.organizerId = _organizerWrapper.getId();
        jsonObject.guildId = _guildId;
        jsonObject.channelId = _channelId;
        jsonObject.roleId = _roleId;
        jsonObject.version = "4";
        return jsonObject;
    };
}