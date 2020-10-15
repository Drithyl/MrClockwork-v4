
const config = require("../config/config.json");
const guildDataStore = require("./guild_data_store.js");
const guildWrapperFactory = require("./guild_wrapper_factory.js");
const botClientWrapper = require("./wrappers/bot_client_wrapper.js");

const guildWrappers = {};

module.exports.populateStore = function(discordJsGuildCollection)
{
    return guildDataStore.populateGuildDataStore()
    .then(() => 
    {
        var guildArray = discordJsGuildCollection.array();

        console.log("Finished loading guild data.");
        console.log("Populating guild store...");

        return guildArray.forEachPromise((discordJsGuild, index, nextPromise) =>
        {
            console.log(`Fetching guild...`);
            return discordJsGuild.fetch()
            .then((fetchedDiscordJsGuild) =>
            {
                module.exports.addGuild(fetchedDiscordJsGuild);
                console.log(`${discordJsGuild.name} added.`);
                nextPromise();
            });
        });
    });
};

module.exports.getGuildWrapperById = (guildId) =>
{
    return guildWrappers[guildId];
};

module.exports.getGuildClientData = (userId) =>
{
    var guildData = [];

    for (var id in guildWrappers)
    {
        var guild = guildWrappers[id];
        var id = guild.getId();
        var name = guild.getName();
        var member = guild.getGuildMemberWrapperById(userId);

        if (guild.memberHasTrustedRole(member) === true || guild.memberHasGameMasterRole(member) === true || guild.memberIsOwner(userId) === true)
            guildData.push({ id, name });
    }

    return guildData;
};

module.exports.hasGuildWrapper = (guildId) =>
{
    return guildWrappers[guildId] != null;
};

module.exports.forEachGuild = (fnToCall) =>
{
    for (var id in guildWrappers)
    {
        fnToCall(guildWrappers[id]);
    }
};

module.exports.forEachGuildAsync = (promiseToCall) =>
{
    return guildWrappers.forEachPromise((guildWrapper, index, nextPromise) =>
    {
        return promiseToCall(guildWrapper, index, nextPromise)
        .then(() => nextPromise());
    });
};

module.exports.addGuild = (discordJsGuild) =>
{
    var guildWrapper = guildWrapperFactory.wrapDiscordJsGuild(discordJsGuild);
    var guildId = guildWrapper.getId();

    guildWrappers[guildId] = guildWrapper;
};

exports.deployBotOnGuild = (guildId) =>
{
    var botId = botClientWrapper.getId();
    var guildWrapper = this.getGuildWrapperById(guildId);

    var gameMasterRoleId = guildDataStore.getGameMasterRoleId(guildId);
    var trustedRoleId = guildDataStore.getTrustedRoleId(guildId);
    var blitzerRoleId = guildDataStore.getBlitzerRoleId(guildId);

    var newsChannelId = guildDataStore.getNewsChannelId(guildId);
    var helpChannelId = guildDataStore.getHelpChannelId(guildId);

    var recruitingCategoryId = guildDataStore.getRecruitingCategoryId(guildId);
    var blitzRecruitingCategoryId = guildDataStore.getBlitzRecruitingCategoryId(guildId);
    var gameCategoryId = guildDataStore.getGameCategoryId(guildId);
    var blitzCategoryId = guildDataStore.getBlitzCategoryId(guildId);


    return guildWrapper.findOrCreateRole(gameMasterRoleId, config.gameMasterRoleName, true, guildDataStore.getGameMasterRolePermissionOverwrites())
    .then((role) => guildDataStore.setGameMasterRoleId(guildId, role.id))

    .then(() => guildWrapper.findOrCreateRole(trustedRoleId, config.trustedRoleName, false, guildDataStore.getTrustedRolePermissionOverwrites()))
    .then((role) => guildDataStore.setTrustedRoleId(guildId, role.id))
    
    .then(() => guildWrapper.findOrCreateRole(blitzerRoleId, config.blitzerRoleName, true, guildDataStore.getBlitzerRolePermissionOverwrites()))
    .then((role) => guildDataStore.setBlitzerRoleId(guildId, role.id))
    

    .then(() => guildWrapper.findOrCreateChannel(
        newsChannelId, 
        config.newsChannelName, 
        [
            { 
                id: guildId, 
                deny: guildDataStore.getNewsChannelMemberPermissionOverwrites("deny"),
                allow: guildDataStore.getNewsChannelMemberPermissionOverwrites("allow") 
            },
            { 
                id: botId, 
                deny: guildDataStore.getNewsChannelBotPermissionOverwrites("deny"),
                allow: guildDataStore.getNewsChannelBotPermissionOverwrites("allow") 
            }
        ]
    ))
    .then((channel) => guildDataStore.setNewsChannelId(guildId, channel.id))

    .then(() => guildWrapper.findOrCreateChannel(
        helpChannelId, 
        config.helpChannelName, 
        [
            { 
                id: guildId, 
                deny: guildDataStore.getHelpChannelMemberPermissionOverwrites("deny"),
                allow: guildDataStore.getHelpChannelMemberPermissionOverwrites("allow") 
            },
            { 
                id: botId, 
                deny: guildDataStore.getHelpChannelBotPermissionOverwrites("deny"),
                allow: guildDataStore.getHelpChannelBotPermissionOverwrites("allow") 
            }
        ]
    ))
    .then((channel) => guildDataStore.setHelpChannelId(guildId, channel.id))


    .then(() => guildWrapper.findOrCreateCategory(
        recruitingCategoryId, 
        config.recruitingCategoryName, 
        [
            { 
                id: guildId, 
                deny: guildDataStore.getRecruitingCategoryMemberPermissionOverwrites("deny"),
                allow: guildDataStore.getRecruitingCategoryMemberPermissionOverwrites("allow") 
            },
            { 
                id: botId, 
                deny: guildDataStore.getRecruitingCategoryBotPermissionOverwrites("deny"),
                allow: guildDataStore.getRecruitingCategoryBotPermissionOverwrites("allow") 
            }
        ]
    ))
    .then((category) => guildDataStore.setRecruitingCategoryId(guildId, category.id))

    .then(() => guildWrapper.findOrCreateCategory(
        blitzRecruitingCategoryId, 
        config.blitzRecruitingCategoryName, 
        [
            { 
                id: guildId, 
                deny: guildDataStore.getBlitzRecruitingCategoryMemberPermissionOverwrites("deny"),
                allow: guildDataStore.getBlitzRecruitingCategoryMemberPermissionOverwrites("allow") 
            },
            { 
                id: botId, 
                deny: guildDataStore.getBlitzRecruitingCategoryBotPermissionOverwrites("deny"),
                allow: guildDataStore.getBlitzRecruitingCategoryBotPermissionOverwrites("allow") 
            }
        ]
    ))
    .then((category) => guildDataStore.setBlitzRecruitingCategoryId(guildId, category.id))

    .then(() => guildWrapper.findOrCreateCategory(
        gameCategoryId, 
        config.gameCategoryName, 
        [
            { 
                id: guildId, 
                deny: guildDataStore.getGameCategoryMemberPermissionOverwrites("deny"),
                allow: guildDataStore.getGameCategoryMemberPermissionOverwrites("allow") 
            },
            { 
                id: botId, 
                deny: guildDataStore.getGameCategoryBotPermissionOverwrites("deny"),
                allow: guildDataStore.getGameCategoryBotPermissionOverwrites("allow") 
            }
        ]
    ))
    .then((category) => guildDataStore.setGameCategoryId(guildId, category.id))

    .then(() => guildWrapper.findOrCreateCategory(
        blitzCategoryId, 
        config.blitzCategoryName, 
        [
            { 
                id: guildId, 
                deny: guildDataStore.getBlitzCategoryMemberPermissionOverwrites("deny"),
                allow: guildDataStore.getBlitzCategoryMemberPermissionOverwrites("allow") 
            },
            { 
                id: botId, 
                deny: guildDataStore.getBlitzCategoryBotPermissionOverwrites("deny"),
                allow: guildDataStore.getBlitzCategoryBotPermissionOverwrites("allow") 
            }
        ]
    ))
    .then((category) => guildDataStore.setBlitzCategoryId(guildId, category.id));
};

exports.updateHelpChannels = (updatedHelpString, idOfGuildToUpdate = "") =>
{
    var guildToUpdate = this.getGuildWrapperById(idOfGuildToUpdate);

    if (guildToUpdate != null)
        return guildToUpdate.updateHelpChannel(updatedHelpString);

    else
    {
        return this.forEachGuildAsync((guildWrapper, index, next) =>
        {
          return guildWrapper.updateHelpChannel(updatedHelpString)
          .then(() => next())
          .catch((err) => 
          {
            console.log(`Error updating ${guildWrapper.getName()}: ${err.message}`);
            return next(); 
          });
        });
    }
};