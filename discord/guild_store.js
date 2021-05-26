
const log = require("../logger.js");
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

        log.general(log.getNormalLevel(), "Finished loading guild data.");
        log.general(log.getNormalLevel(), "Populating guild store...");

        return guildArray.forEachPromise((discordJsGuild, index, nextPromise) =>
        {
            log.general(log.getNormalLevel(), `Fetching guild...`);
            return discordJsGuild.fetch()
            .then((fetchedDiscordJsGuild) =>
            {
                module.exports.addGuild(fetchedDiscordJsGuild);
                log.general(log.getNormalLevel(), `${discordJsGuild.name} added.`);
                nextPromise();
            });
        });
    });
};

module.exports.getGuildWrapperById = (guildId) =>
{
    return guildWrappers[guildId];
};

module.exports.getGuildsWhereUserIsMember = (userId) =>
{
    const guildsWhereUserIsMember = [];

    for (var id in guildWrappers)
    {
        const guild = guildWrappers[id];

        if (guild.isMember(userId) === true)
            guildsWhereUserIsMember.push(guild);
    }

    return guildsWhereUserIsMember;
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

module.exports.getRecruitingCategoryId = (guildId) => guildDataStore.getRecruitingCategoryId(guildId);
module.exports.getBlitzRecruitingCategoryId = (guildId) => guildDataStore.getBlitzRecruitingCategoryId(guildId);
module.exports.getGameCategoryId = (guildId) => guildDataStore.getGameCategoryId(guildId);
module.exports.getBlitzCategoryId = (guildId) => guildDataStore.getBlitzCategoryId(guildId);

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
    return guildWrapper;
};

module.exports.removeGuild = (discordJsGuild) =>
{
    const guildId = discordJsGuild.id;
    delete guildWrappers[guildId];
    return guildDataStore.removeGuildData(guildId);
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

exports.undeployBotOnGuild = (guildId) =>
{
    var guildWrapper = this.getGuildWrapperById(guildId);

    const newsChannel = guildWrapper.getNewsChannel();
    const helpChannel = guildWrapper.getHelpChannel();

    const recruitingCategory = guildWrapper.getRecruitingCategory();
    const blitzRecruitingCategory = guildWrapper.getBlitzRecruitingCategory();
    const gameCategory = guildWrapper.getGameCategory();
    const blitzCategory = guildWrapper.getBlitzCategory();

    const gameMasterRole = guildWrapper.getGameMasterRole();
    const trustedRole = guildWrapper.getTrustedRole();
    const blitzerRole = guildWrapper.getBlitzerRole();

    newsChannel.delete()
    .catch((err) => log.error(log.getLeanLevel(), "COULD NOT DELETE NEWS CHANNEL", err));

    helpChannel.delete()
    .catch((err) => log.error(log.getLeanLevel(), "COULD NOT DELETE HELP CHANNEL", err));

    recruitingCategory.delete()
    .catch((err) => log.error(log.getLeanLevel(), "COULD NOT DELETE RECRUITING CATEGORY", err));

    blitzRecruitingCategory.delete()
    .catch((err) => log.error(log.getLeanLevel(), "COULD NOT DELETE BLITZ RECRUITING CATEGORY", err));

    gameCategory.delete()
    .catch((err) => log.error(log.getLeanLevel(), "COULD NOT DELETE GAME CATEGORY", err));

    blitzCategory.delete()
    .catch((err) => log.error(log.getLeanLevel(), "COULD NOT DELETE BLITZ CATEGORY", err));

    gameMasterRole.delete()
    .catch((err) => log.error(log.getLeanLevel(), "COULD NOT DELETE GAME MASTER ROLE", err));

    trustedRole.delete()
    .catch((err) => log.error(log.getLeanLevel(), "COULD NOT DELETE TRUSTED ROLE", err));

    blitzerRole.delete()
    .catch((err) => log.error(log.getLeanLevel(), "COULD NOT DELETE BLITZER ROLE", err));

    return Promise.resolve();
};

exports.updateHelpChannels = (updatedHelpString, idOfGuildToUpdate = "") =>
{
    var guildToUpdate = this.getGuildWrapperById(idOfGuildToUpdate);

    if (guildToUpdate != null)
        return guildToUpdate.updateHelpChannel(updatedHelpString);

    return guildWrappers.forEachPromise((wrapper, guildId, nextPromise) =>
    {
        log.general(log.getNormalLevel(), `Updating guild ${wrapper.getName()}...`);

        return wrapper.updateHelpChannel(updatedHelpString)
        .then(() => 
        {
            log.general(log.getNormalLevel(), `${wrapper.getName()} help channel updated.`);
            return nextPromise();
        })
        .catch((err) => 
        {
            log.error(log.getLeanLevel(), `ERROR UPDATING ${guildWrapper.getName()} HELP CHANNEL`, err);
            return next(); 
        });
    });
};