
const log = require("../../logger.js");
const guildStore = require("../guild_store.js");
const guildDataStore = require("../guild_data_store.js");
const GuildMemberWrapper = require("./guild_member_wrapper.js");
const { ChannelTypes } = require("discord.js").Constants;

module.exports = GuildWrapper;

function GuildWrapper(discordJsGuildObject)
{
    const _discordJsGuildObject = discordJsGuildObject;

    this.getId = () => _discordJsGuildObject.id;
    this.getName = () => _discordJsGuildObject.name;
    this.getOwnerId = () => _discordJsGuildObject.ownerId;
    this.getMemberCount = () => _discordJsGuildObject.memberCount;
    this.getDiscordJsBotMemberInGuild = () => _discordJsGuildObject.members.me;
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
    this.getOngoingCategory = () => _discordJsGuildObject.channels.cache.get(guildDataStore.getOngoingCategoryId(this.getId()));
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
    this.checkMemberIsTrusted = async (guildMemberWrapper) =>
    {
        if (this.memberIsOwner(guildMemberWrapper.getId()) === true)
            return true;

        const trustedRole = await this.fetchTrustedRole();

        if (trustedRole == null)
            throw new Error(`Guild has no trusted role!`);

        return _memberHasRoleOrHigher(guildMemberWrapper, trustedRole);
    };

    this.checkMemberHasRoleOrAbove = (guildMemberWrapper, role) =>
    {
        if (this.memberIsOwner(guildMemberWrapper.getId()) === true)
            return true;

        return _memberHasRoleOrHigher(guildMemberWrapper, role);
    };
  
    this.createCommand = (data) => _discordJsGuildObject.commands.create(data);
    this.setCommands = (bulkData) => _discordJsGuildObject.commands.set(bulkData);
    
    this.wasDiscordElementCreatedByBot = (discordId) =>
    {
        const guildData = guildDataStore.getGuildData(this.getId());

        for (let key in guildData)
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
        let helpChannel = this.getHelpChannel();

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

    this.deployBot = (client) => guildStore.deployBotOnGuild(client, this.getId());
    this.undeployBot = (client) => guildStore.undeployBotOnGuild(client, this.getId());

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

    this.findOrCreateChannel = (existingId, ...args) =>
    {
        log.general(log.getVerboseLevel(), `Finding channel ${existingId}...`);
        let existingChannel = this.findChannel(existingId);

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
        let existingRole = this.findRole(existingId);

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

    this.createChannel = async (options) => 
    {
        log.general(log.getVerboseLevel(), `Creating channel ${options.name}...`);
        const channel = await _discordJsGuildObject.channels.create(options);
        
        log.general(log.getVerboseLevel(), `Channel created`); 
        return channel;
    };

    this.createRole = async (options) =>
    {
        log.general(log.getVerboseLevel(), `Creating role ${options.name}...`);
        const role = await _discordJsGuildObject.roles.create(options);
            
        log.general(log.getVerboseLevel(), `Role created.`);
        return role;
    };

    this.getRoleById = (roleId) => _discordJsGuildObject.roles.cache.get(roleId);
    this.getChannelById = (channelId) => _discordJsGuildObject.channels.cache.get(channelId);

    this.fetchRoleById = (roleId) => _discordJsGuildObject.roles.fetch(roleId, { cache: true });
    this.fetchChannelById = (channelId) => _discordJsGuildObject.channels.fetch(channelId, { cache: true });

    this.getRoleByName = (roleName) => _discordJsGuildObject.roles.cache.find("name", roleName);
    this.getChannelByName = (channelName) => _discordJsGuildObject.channels.cache.find("name", channelName);

    this.fetchDiscordJsGuildMemberById = (memberId) => _discordJsGuildObject.members.fetch(memberId, { cache: true });
    this.fetchGuildMemberWrapperById = (memberId) => 
    {
        return this.fetchDiscordJsGuildMemberById(memberId)
        .then((discordJsGuildMember) => new GuildMemberWrapper(discordJsGuildMember, this))
        .catch((err) => Promise.reject(err));
    };

    this.checkIfMember = (userId) => 
    {
        return this.fetchDiscordJsGuildMemberById(userId)
        .then(true)
        .catch(false);
    };

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
}


async function _clearChannel(channel)
{
    log.general(log.getVerboseLevel(), "Last message id", channel.lastMessageId);

    if (channel.lastMessageId == null)
    {
        log.general(log.getVerboseLevel(), "Channel already empty.");
        return;
    }

    try
    {
        const messages = await _fetchMessages(channel);
        await _deleteMessages(messages);
    }
    
    // If last message id exists but gives an error when fetching, it's 
    // because the message was deleted, but the id is still cached
    catch(err)
    {
        return;
    }
}

async function _fetchMessages(channel)
{
    const messageArray = [];
    const lastMessage = await channel.messages.fetch(channel.lastMessageId);
    log.general(log.getVerboseLevel(), `Fetched last message ${lastMessage.id}`);
    
    const messages = await channel.messages.fetch({ before: lastMessage.id });


    if (lastMessage != null)
        messageArray.push(lastMessage);

    if (messages != null)
        messageArray.push(...messages.values());
    

    log.general(log.getVerboseLevel(), `Fetched previous messages; total fetched: ${messageArray.length}`);
    return messageArray;
}

async function _deleteMessages(messages)
{
    const promises = messages.map(async (message) =>
    {
        log.general(log.getVerboseLevel(), `Deleting message ${message.id}...`);

        try
        {
            await message.delete();
            log.general(log.getVerboseLevel(), "Message deleted.");
        }

        catch(err)
        {
            log.error(log.getNormalLevel(), `ERROR DELETING MESSAGE`, err);
        }
    });

    await Promise.allSettled(promises);
}