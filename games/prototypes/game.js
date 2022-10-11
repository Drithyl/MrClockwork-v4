
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
        return _guildWrapper.createChannel(`${this.getName()}`, [
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

            if (status != null && status.hasStarted() === true)
            {
                log.general(log.getVerboseLevel(), `Game already started; moving to started category ${guildStore.getGameCategoryId(guildId)}`);
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
        if (this.isServerOnline() === false)
            return Promise.resolve(false);

        return this.emitPromiseToServer("ONLINE_CHECK", this.getPort());
    };

    this.isServerOnline = () => 
    {
        if (_hostServer == null)
            return false;

        else return _hostServer.isOnline();
    };

    this.emitPromiseToServer = (...args) => _hostServer.emitPromise(...args);
    this.listenToServer = (trigger, handler) => _hostServer.onMessage(trigger, handler);

    this.getDiscordGuildWrapper = () => _guildWrapper;
    this.getOrganizerMemberWrapper = () => _organizerWrapper;

    this.getSettingsObject = () => _settingsObject;

    this.setSettingsObject = (settingsObject) => 
    {
        assert.isInstanceOfPrototype(settingsObject, GameSettings);
        _settingsObject = settingsObject;
    };

    this.sendMessageToChannel = (text) =>
    {
        const channel = this.getChannel();

        if (channel != null)
            return new MessagePayload(text).send(channel);

        else return this.sendMessageToOrganizer(`No channel for game ${this.getName()} was found to send the annoucement below. You can use commands to create a new one for the game:\n\n${text}`);
    };

    this.sendGameAnnouncement = (text) => 
    {
        const channel = this.getChannel();
        const role = this.getRole();
        const roleStr = (role != null) ? role.toString() : "`[No game role found to mention]`";

        if (channel != null)
            return new MessagePayload(`${roleStr} ${text}`).send(channel);

        else return this.sendMessageToOrganizer(`No channel for game ${this.getName()} was found to send the annoucement below. You can use commands to create a new one for the game:\n\n${text}`);
    };


    this.sendMessageToOrganizer = (text) => 
    {
        if (_organizerWrapper != null)
            return _organizerWrapper.sendMessage(new MessagePayload(text));
            
        else return Promise.resolve();
    };

    this.pinSettingsToChannel = () =>
    {
        var addressString = `IP: ${this.getIp()}:${this.getPort()}\nServer: ${this.getServer().getName()}\n\n`;
        var settingsStringList = _settingsObject.getPublicSettingsStringList();
        var channel = this.getChannel();
        const payload = new MessagePayload((addressString + settingsStringList).toBox());

        if (_discordJsChannel == null)
            return Promise.reject(new Error(`${this.getName()} does not have a channel assigned.`));

        return payload.send(channel, { pin: true });
    };

    this.addToStore = () => ongoingGamesStore.addOngoingGame(this);

    this.save = async () =>
    {
        const filename = "data.json";
        const gameName = this.getName();
        const path = `${config.dataPath}/${config.gameDataFolder}/${gameName}`;
        const filePath = `${path}/${filename}`;
        const tmpFilePath = `${filePath}.new`;
        const data = JSON.stringify(this, null, 2);
        

        if (fs.existsSync(path) === false)
        {
            log.general(log.getVerboseLevel(), `Directory for game data does not exist, creating it.`);
            await fsp.mkdir(path);
        }

        try
        {
            await fsp.writeFile(tmpFilePath, data);
            await fsp.rename(tmpFilePath, filePath);
        }

        catch(err)
        {
            log.error(log.getLeanLevel(), `Error writing game data: ${err.message}`);
        }
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

    this.loadJSONDataSuper = async (jsonData) =>
    {
        log.general(log.getLeanLevel(), `${jsonData.name}: asserting basic properties...`);

        assert.isObjectOrThrow(jsonData);
        assert.isObjectOrThrow(jsonData.settings);
        assert.isStringOrThrow(jsonData.name);
        assert.isIntegerOrThrow(jsonData.port);
        assert.isStringOrThrow(jsonData.serverId);
        assert.isStringOrThrow(jsonData.guildId);

        log.general(log.getLeanLevel(), `${jsonData.name}: getting guild and server...`);

        var guild = guildStore.getGuildWrapperById(jsonData.guildId);
        var server = hostServerStore.getHostServerById(jsonData.serverId);

        if (guild == null)
            throw new Error(`Guild with id ${jsonData.guildId} cannot be found; skipping game ${jsonData.name}`);

        log.general(log.getLeanLevel(), `${jsonData.name}: setting basic properties...`);

        this.setGuild(guild);
        this.setServer(server);
        this.setName(jsonData.name);
        this.setPort(jsonData.port);

        try
        {
            log.general(log.getLeanLevel(), `${jsonData.name}: fetching organizer ${jsonData.organizerId}...`);
            const organizerWrapper = await guild.fetchGuildMemberWrapperById(jsonData.organizerId);
            log.general(log.getLeanLevel(), `${jsonData.name}: setting organizer...`);
            this.setOrganizer(organizerWrapper);
        }

        catch(err)
        {
            log.general(log.getLeanLevel(), `${this.getName()}: organizer ${jsonData.organizerId} could not be fetched; setting guild owner instead.`);
            const organizerWrapper = await guild.fetchOwner();
            log.general(log.getLeanLevel(), `${jsonData.name}: setting owner as organizer...`);
            this.setOrganizer(organizerWrapper);
        }

        try
        {
            if (assert.isString(jsonData.channelId) === true)
            {
                const channel = await guild.fetchChannelById(jsonData.channelId);
                this.setChannel(channel);
            }
        }

        catch(err)
        {
            log.general(log.getLeanLevel(), `${jsonData.name}: no channel found`);
        }

        try
        {
            if (assert.isString(jsonData.roleId) === true)
            {
                const role = await guild.fetchRoleById(jsonData.roleId);
                this.setRole(role);
            }
        }

        catch(err)
        {
            log.general(log.getLeanLevel(), `${jsonData.name}: no role found`);
        }

        _settingsObject.loadJSONData(jsonData.settings, jsonData.needsPatching);
        log.general(log.getLeanLevel(), `${jsonData.name}: finished loadJSONDataSuper()`);
        return this;
    };

    this.toJSONSuper = () =>
    {
        var jsonObject = {};
        jsonObject.name = this.getName();
        jsonObject.port = _port;
        jsonObject.serverId = _hostServer.getId();
        jsonObject.settings = _settingsObject.toJSON();
        jsonObject.organizerId = _organizerWrapper.getId();
        jsonObject.guildId = _guildId;
        jsonObject.channelId = _channelId;
        jsonObject.roleId = _roleId;
        jsonObject.version = "4";
        return jsonObject;
    };
}