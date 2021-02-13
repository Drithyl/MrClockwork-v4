
const messenger = require("../messenger.js");
const guildStore = require("../guild_store.js");
const guildDataStore = require("../guild_data_store.js");
const GuildMemberWrapper = require("./guild_member_wrapper.js");

module.exports = GuildWrapper;

function GuildWrapper(discordJsGuildObject)
{
    const _discordJsGuildObject = discordJsGuildObject;

    this.getId = () => _discordJsGuildObject.id;
    this.getName = () => _discordJsGuildObject.name;
    this.getOwner = () => _discordJsGuildObject.owner;
    this.getDiscordJsBotMemberInGuild = () => _discordJsGuildObject.me;
    this.isAvailable = () => _discordJsGuildObject.available;


    this.getNewsChannel = () => _discordJsGuildObject.channels.cache.get(guildDataStore.getNewsChannelId(this.getId()));
    this.getHelpChannel = () => _discordJsGuildObject.channels.cache.get(guildDataStore.getHelpChannelId(this.getId()));

    this.getRecruitingCategory = () => _discordJsGuildObject.channels.cache.get(guildDataStore.getRecruitingCategoryId(this.getId()));
    this.getBlitzRecruitingCategory = () => _discordJsGuildObject.channels.cache.get(guildDataStore.getBlitzRecruitingCategoryId(this.getId()));
    this.getGameCategory = () => _discordJsGuildObject.channels.cache.get(guildDataStore.getGameCategoryId(this.getId()));
    this.getBlitzCategory = () => _discordJsGuildObject.channels.cache.get(guildDataStore.getBlitzCategoryId(this.getId()));

    this.getGameMasterRole = () => _discordJsGuildObject.roles.cache.get(guildDataStore.getGameMasterRoleId(this.getId()));
    this.getTrustedRole = () => _discordJsGuildObject.roles.cache.get(guildDataStore.getTrustedRoleId(this.getId()));
    this.getBlitzerRole = () => _discordJsGuildObject.roles.cache.get(guildDataStore.getBlitzerRoleId(this.getId()));


    this.memberIsOwner = (memberId) => memberId === _discordJsGuildObject.ownerID;
    this.memberHasTrustedRole = (guildMemberWrapper) => guildMemberWrapper.hasRole(guildDataStore.getTrustedRoleId(this.getId())) === true;
    this.memberHasBlitzerRole = (guildMemberWrapper) => guildMemberWrapper.hasRole(guildDataStore.getBlitzerRoleId(this.getId())) === true;
    this.memberHasGameMasterRole = (guildMemberWrapper) => guildMemberWrapper.hasRole(guildDataStore.getBlitzerRoleId(this.getId())) === true;
    
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

    this.postNews = (newsString) => 
    {
        const newsChannel = this.getNewsChannel();
        return messenger.send(newsChannel, newsString);
    };

    this.updateHelpChannel = (updatedHelpString) =>
    {
        var helpChannel = this.getHelpChannel();

        if (helpChannel == null)
            return Promise.resolve();

        return _clearChannel(helpChannel)
        .then(() => messenger.send(helpChannel, updatedHelpString, { prepend: "", append: "" }));
    };

    this.deployBot = () => guildStore.deployBotOnGuild(this.getId());
    this.undeployBot = () => guildStore.undeployBotOnGuild(this.getId());

    this.findChannel = (channelId) => 
    {
        console.log(`Searching for channel ${channelId}`);
        return _discordJsGuildObject.channels.resolve(channelId);
    };

    this.findRole = (roleId) => 
    {
        console.log(`Searching for role ${roleId}`);
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
        console.log(`Finding channel ${existingId}...`);
        var existingChannel = this.findChannel(existingId);

        if (existingChannel != null)
        {
            console.log(`Channel exists, resolving.`);
            return Promise.resolve(existingChannel);
        }
            
        else 
        {
            console.log(`Channel not found`);
            return this.createChannel(...args); 
        }
    };

    this.findOrCreateRole = (existingId, ...args) =>
    {
        console.log(`Finding role ${existingId}...`);
        var existingRole = this.findRole(existingId);

        if (existingRole != null)
        {
            console.log(`Role exists, resolving.`);
            return Promise.resolve(existingRole);
        }

        else
        {
            console.log(`Role not found`);
            return this.createRole(...args);
        }
    };

    this.createCategory = (name, permissions) => 
    {
        return _discordJsGuildObject.channels.create(name, {type: "category", permissionOverwrites: permissions});
    };

    this.createChannel = (name, permissionOverwrites, parent = null) => 
    {
        console.log(`Creating channel ${name}...`);
        return _discordJsGuildObject.channels.create(name, 
        {
            type: "text", 
            permissionOverwrites, 
            parent
        })
        .then((channel) =>
        {
            console.log(`Channel created`);
            return Promise.resolve(channel);
        });
    };

    this.createRole = (name, mentionable, permissions) =>
    {
        console.log(`Creating role ${name}...`);
        return _discordJsGuildObject.roles.create({ 
            data:
            {
            name,
            mentionable,
            permissions
            }
        })
        .then((role) => 
        {
            console.log(`Role created.`);
            return Promise.resolve(role);
        });
    };

    this.createGameChannel = (name) => this.createChannel(name, null, this.getRecruitingCategory());
    this.createGameRole = (name) => this.createRole(name, true, null);

    this.getRoleById = (roleId) => _discordJsGuildObject.roles.cache.get(roleId);
    this.getChannelById = (channelId) => _discordJsGuildObject.channels.cache.get(channelId);

    this.getRoleByName = (roleName) => _discordJsGuildObject.roles.cache.find("name", roleName);
    this.getChannelByName = (channelName) => _discordJsGuildObject.channels.cache.find("name", channelName);

    this.getDiscordJsGuildMemberById = (memberId) => _discordJsGuildObject.member(memberId);
    this.getGuildMemberWrapperById = (memberId) => 
    {
        var discordJsGuildMember = this.getDiscordJsGuildMemberById(memberId);
        return new GuildMemberWrapper(discordJsGuildMember, this);
    };

    this.isMember = (userId) => this.getDiscordJsGuildMemberById(userId) != null;

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

    /** The channel.bulkDelete method does not work since it cannot delete messages
     *  older than 14 days, even with the boolean option set to true.
     */
    function _clearChannel(channel)
    {
        var _lastMessage;

        return channel.messages.fetch(channel.lastMessageID)
        .then((lastMessage) =>
        {
            _lastMessage = lastMessage;
            
            /** fetch all messages before last in channel */
            return channel.messages.fetch({ before: lastMessage.id });
        })
        .then((messages) =>
        {
            const messageArray = messages.array();
            messageArray.push(_lastMessage);

            /** delete all messages before last */
            return messageArray.forEachPromise((message, index, nextPromise) =>
            {
                console.log("Deleting message " + channel.id);
                return message.delete()
                .then(() => nextPromise());
            });
        });
    }
}
