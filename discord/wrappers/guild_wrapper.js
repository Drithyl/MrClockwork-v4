
const log = require("../../logger.js");
const guildStore = require("../guild_store.js");
const guildDataStore = require("../guild_data_store.js");
const GuildMemberWrapper = require("./guild_member_wrapper.js");

module.exports = GuildWrapper;

function GuildWrapper(discordJsGuildObject)
{
    const _discordJsGuildObject = discordJsGuildObject;

    this.getId = () => _discordJsGuildObject.id;
    this.getName = () => _discordJsGuildObject.name;
    this.getOwnerId = () => _discordJsGuildObject.ownerId;
    this.getMemberCount = () => _discordJsGuildObject.memberCount;
    this.getDiscordJsBotMemberInGuild = () => _discordJsGuildObject.me;
    this.isAvailable = () => _discordJsGuildObject.available;
    this.fetchOwner = async () => 
    {
        const discordJsOwnerObject = await _discordJsGuildObject.fetchOwner({ cache: true });
        return new GuildMemberWrapper(discordJsOwnerObject, this);
    };

    this.getNewsChannel = () => _discordJsGuildObject.channels.cache.get(guildDataStore.getNewsChannelId(this.getId()));
    this.getHelpChannel = () => _discordJsGuildObject.channels.cache.get(guildDataStore.getHelpChannelId(this.getId()));

    this.getRecruitingCategory = () => _discordJsGuildObject.channels.cache.get(guildDataStore.getRecruitingCategoryId(this.getId()));
    this.getBlitzRecruitingCategory = () => _discordJsGuildObject.channels.cache.get(guildDataStore.getBlitzRecruitingCategoryId(this.getId()));
    this.getGameCategory = () => _discordJsGuildObject.channels.cache.get(guildDataStore.getGameCategoryId(this.getId()));
    this.getBlitzCategory = () => _discordJsGuildObject.channels.cache.get(guildDataStore.getBlitzCategoryId(this.getId()));

    this.getGameMasterRole = () => _discordJsGuildObject.roles.cache.get(guildDataStore.getGameMasterRoleId(this.getId()));
    this.getTrustedRole = () => _discordJsGuildObject.roles.cache.get(guildDataStore.getTrustedRoleId(this.getId()));
    this.getBlitzerRole = () => _discordJsGuildObject.roles.cache.get(guildDataStore.getBlitzerRoleId(this.getId()));

    this.fetchGameMasterRole = () => _discordJsGuildObject.roles.fetch(guildDataStore.getGameMasterRoleId(this.getId()), { cache: true });
    this.fetchTrustedRole = () => _discordJsGuildObject.roles.fetch(guildDataStore.getTrustedRoleId(this.getId()), { cache: true });
    this.fetchBlitzerRole = () => _discordJsGuildObject.roles.fetch(guildDataStore.getBlitzerRoleId(this.getId()), { cache: true });


    this.memberIsOwner = (memberId) => memberId === _discordJsGuildObject.ownerId;
    this.memberHasTrustedRole = (guildMemberWrapper) => guildMemberWrapper.hasRole(guildDataStore.getTrustedRoleId(this.getId())) === true;
    this.memberHasBlitzerRole = (guildMemberWrapper) => guildMemberWrapper.hasRole(guildDataStore.getBlitzerRoleId(this.getId())) === true;
    this.memberHasGameMasterRole = (guildMemberWrapper) => guildMemberWrapper.hasRole(guildDataStore.getGameMasterRoleId(this.getId())) === true;
    this.checkMemberHasTrustedRoleOrHigher = async (guildMemberWrapper) =>
    {
        if (this.memberIsOwner() === true)
            return true;

        const trustedRole = await this.fetchTrustedRole();

        if (trustedRole == null)
            throw new Error(`Guild has no trusted role!`);

        return _memberHasRoleOrHigher(guildMemberWrapper, trustedRole);
    };
    
    this.checkMemberHasGameMasterRoleOrHigher = async (guildMemberWrapper) =>
    {
        if (this.memberIsOwner() === true)
            return true;
            
        const gameMasterRole = await this.fetchGameMasterRole();

        if (gameMasterRole == null)
            throw new Error(`Guild has no Game Master role!`);

        return _memberHasRoleOrHigher(guildMemberWrapper, gameMasterRole);
    };
  
    this.createCommand = (data) => _discordJsGuildObject.commands.create(data);
    this.setCommands = (bulkData) => _discordJsGuildObject.commands.set(bulkData);
    
    this.wasDiscordElementCreatedByBot = (discordId) =>
    {
        const guildData = guildDataStore.getGuildData(this.getId());

        for (var key in guildData)
        {
            if (guildData[key] === discordId)
                return true;
        }

        return false;
    };

    this.clearData = (discordId) => guildDataStore.clearGuildData(this.getId(), discordId);

    this.postNews = (payload) => 
    {
        const newsChannel = this.getNewsChannel();
        return payload.send(newsChannel);
    };

    this.updateHelpChannel = (payload) =>
    {
        var helpChannel = this.getHelpChannel();

        if (helpChannel == null)
        {
            log.general(log.getNormalLevel(), `Help channel for ${this.getName()} does not exist; cannot update.`);
            return Promise.resolve();
        }

        return _clearChannel(helpChannel)
        .then(() => 
        {
            log.general(log.getVerboseLevel(), `${this.getName()}'s help channel cleared; sending new help string.`);
            payload.send(helpChannel);
        });
    };

    this.deployBot = () => guildStore.deployBotOnGuild(this.getId());
    this.undeployBot = () => guildStore.undeployBotOnGuild(this.getId());

    this.findChannel = (channelId) => 
    {
        log.general(log.getVerboseLevel(), `Searching for channel ${channelId}`);
        return _discordJsGuildObject.channels.resolve(channelId);
    };

    this.findRole = (roleId) => 
    {
        log.general(log.getVerboseLevel(), `Searching for role ${roleId}`);
        return _discordJsGuildObject.roles.resolve(roleId);
    };

    this.findOrCreateCategory = (existingId, ...args) =>
    {
        var existingCategory = this.findChannel(existingId);

        if (existingCategory != null)
            return Promise.resolve(existingCategory);

        else return this.createCategory(...args);
    };

    this.findOrCreateChannel = (existingId, ...args) =>
    {
        log.general(log.getVerboseLevel(), `Finding channel ${existingId}...`);
        var existingChannel = this.findChannel(existingId);

        if (existingChannel != null)
        {
            log.general(log.getVerboseLevel(), `Channel exists, resolving.`);
            return Promise.resolve(existingChannel);
        }
            
        else 
        {
            log.general(log.getVerboseLevel(), `Channel not found`);
            return this.createChannel(...args); 
        }
    };

    this.findOrCreateRole = (existingId, ...args) =>
    {
        log.general(log.getVerboseLevel(), `Finding role ${existingId}...`);
        var existingRole = this.findRole(existingId);

        if (existingRole != null)
        {
            log.general(log.getVerboseLevel(), `Role exists, resolving.`);
            return Promise.resolve(existingRole);
        }

        else
        {
            log.general(log.getVerboseLevel(), `Role not found`);
            return this.createRole(...args);
        }
    };

    this.createCategory = (name, permissions) => 
    {
        return _discordJsGuildObject.channels.create(name, {type: "category", permissionOverwrites: permissions});
    };

    this.createChannel = (name, permissionOverwrites = [], parent = null) => 
    {
        log.general(log.getVerboseLevel(), `Creating channel ${name}...`);
        return _discordJsGuildObject.channels.create(name, 
        {
            type: "text", 
            permissionOverwrites, 
            parent: parent
        })
        .then((channel) =>
        {
            log.general(log.getVerboseLevel(), `Channel created`);
            return Promise.resolve(channel);
        });
    };

    this.createRole = (name, mentionable, permissions = []) =>
    {
        log.general(log.getVerboseLevel(), `Creating role ${name}...`);
        return _discordJsGuildObject.roles.create({
            name,
            mentionable,
            permissions
        })
        .then((role) => 
        {
            log.general(log.getVerboseLevel(), `Role created.`);
            return Promise.resolve(role);
        });
    };

    this.createGameChannel = (name) => this.createChannel(name, [], this.getRecruitingCategory());
    this.createGameRole = (name) => this.createRole(name, true);

    this.getRoleById = (roleId) => _discordJsGuildObject.roles.cache.get(roleId);
    this.getChannelById = (channelId) => _discordJsGuildObject.channels.cache.get(channelId);

    this.fetchRoleById = (roleId) => _discordJsGuildObject.roles.fetch(roleId, { cache: true });
    this.fetchChannelById = (channelId) => _discordJsGuildObject.channels.fetch(channelId, { cache: true });

    this.getRoleByName = (roleName) => _discordJsGuildObject.roles.cache.find("name", roleName);
    this.getChannelByName = (channelName) => _discordJsGuildObject.channels.cache.find("name", channelName);

    this.getDiscordJsGuildMemberById = (memberId) => _discordJsGuildObject.members.cache.get(memberId);
    this.fetchDiscordJsGuildMemberById = (memberId) => _discordJsGuildObject.members.fetch(memberId, { cache: true });
    this.getGuildMemberWrapperById = (memberId) => 
    {
        var discordJsGuildMember = this.getDiscordJsGuildMemberById(memberId);
        return new GuildMemberWrapper(discordJsGuildMember, this);
    };

    this.fetchGuildMemberWrapperById = (memberId) => 
    {
        return this.fetchDiscordJsGuildMemberById(memberId)
        .then((discordJsGuildMember) => new GuildMemberWrapper(discordJsGuildMember, this))
        .catch((err) => Promise.reject(err));
    };

    this.checkIfMember = async (userId) => 
    {
        return this.fetchDiscordJsGuildMemberById(userId)
        .then((member) => true)
        .catch((err) => false);
    }

    this.doesBotHavePermission = (permissionFlag) =>
    {
        const botGuildMemberJsObject = this.getDiscordJsBotMemberInGuild();
        return botGuildMemberJsObject.permissions.has(permissionFlag);
    };

    this.replaceRoleWith = (idOfRoleToBeReplaced, idOfRoleToTakeItsPlace) =>
    {
        const oldRole = this.getRoleById(idOfRoleToBeReplaced);
        const newRole = this.getRoleById(idOfRoleToTakeItsPlace);

        if (oldRole == null)
            return Promise.reject(new Error(`Cannot find old role.`));

        if (newRole == null)
            return Promise.reject(new Error(`Cannot find new role.`));

        
        return guildDataStore.replaceRoleWithNew(this.getId(), idOfRoleToBeReplaced, idOfRoleToTakeItsPlace);
    };


    function _memberHasRoleOrHigher(guildMemberWrapper, role)
    {
        const highestPosition = guildMemberWrapper.getHighestDiscordRolePosition();
        return highestPosition >= role.position;
    }


    /** The channel.bulkDelete method does not work since it cannot delete messages
     *  older than 14 days, even with the boolean option set to true.
     */
    function _clearChannel(channel)
    {
        var _lastMessage;

        log.general(log.getVerboseLevel(), "Last message id", channel.lastMessageId);

        if (channel.lastMessageId == null)
        {
            log.general(log.getVerboseLevel(), "Channel already empty.");
            return Promise.resolve();
        }

        return channel.messages.fetch(channel.lastMessageId)
        .then((lastMessage) =>
        {
            log.general(log.getVerboseLevel(), `Fetched last message ${lastMessage.id}`);
            _lastMessage = lastMessage;
            
            // Fetch all messages before last in channel
            return channel.messages.fetch({ before: lastMessage.id });
        },
        // If last message id exists but gives an error when fetching, it's because
        // the message was deleted, but the id is still cached
        (err) => Promise.resolve())
        .then((messages) =>
        {
            var messageArray = [];

            if (_lastMessage != null)
                messageArray.push(_lastMessage);

            if (messages != null)
                messageArray.push(...messages.values());
            
            log.general(log.getVerboseLevel(), `Fetched previous messages; total fetched: ${messageArray.length}`);

            // Delete all messages
            return messageArray.forAllPromises((message) =>
            {
                log.general(log.getVerboseLevel(), `Deleting message ${channel.id}...`);
                return message.delete()
                .then(() => log.general(log.getVerboseLevel(), "Message deleted."))
                .catch((err) => 
                {
                    log.error(log.getNormalLevel(), `ERROR DELETING MESSAGE`, err);
                    return Promise.reject(err);
                });
            });
        });
    }
}
