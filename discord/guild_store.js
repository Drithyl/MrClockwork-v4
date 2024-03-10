
const log = require("../logger.js");
const guildDataStore = require("./guild_data_store.js");
const guildWrapperFactory = require("./guild_wrapper_factory.js");
const GuildSetup = require("./guild_setup.js");
const { RESTJSONErrorCodes } = require('discord.js');

const guildWrappers = {};

module.exports.populateStore = async function(discordJsGuildCollection)
{
    await guildDataStore.populateGuildDataStore();

    const guildArray = [...discordJsGuildCollection.values()];
    const promises = guildArray.map(async (discordJsGuild) =>
    {
        log.general(log.getNormalLevel(), `Fetching guild...`);
        const fetchedDiscordJsGuild = await discordJsGuild.fetch();

        module.exports.addGuild(fetchedDiscordJsGuild);
        log.general(log.getNormalLevel(), `${discordJsGuild.name} added.`);
    });

    log.general(log.getNormalLevel(), "Finished loading guild data.");
    log.general(log.getNormalLevel(), "Populating guild store...");

    await Promise.allSettled(promises);
};

module.exports.getGuildWrapperById = (guildId) =>
{
    return guildWrappers[guildId];
};

module.exports.getGuildsWhereUserIsMember = async (userId) =>
{
    const guildsWhereUserIsMember = [];

    for (let id in guildWrappers)
    {
        const guild = guildWrappers[id];
        const isMember = await guild.checkIfMember(userId);

        if (isMember === true)
            guildsWhereUserIsMember.push(guild);
    }

    return guildsWhereUserIsMember;
};

module.exports.getGuildsWhereUserIsTrusted = async (userId) =>
{
    const guildsWhereUserIsTrusted = [];

    for (let id in guildWrappers)
    {
        const guild = guildWrappers[id];

        try
        {
            const guildMemberWrapper = await guild.fetchGuildMemberWrapperById(userId);
            const isTrusted = await guild.checkMemberIsTrusted(guildMemberWrapper);
    
            if (isTrusted === true)
                guildsWhereUserIsTrusted.push(guild);
        }

        catch(err)
        {
            const ignorableErrorCodes = [
                RESTJSONErrorCodes.UnknownMember
            ];

            if (ignorableErrorCodes.includes(err.code) === false) {
                log.error(log.getLeanLevel(), `Guild ${guild.getName()} (${id}) error checking trusted role`, err.stack);
            }
        }
    }

    return guildsWhereUserIsTrusted;
};

module.exports.fetchGuildClientData = async (userId) =>
{
    const guildData = [];
    const promises = guildWrappers.map(async (guild) =>
    {
        const id = guild.getId();
        const name = guild.getName();

        const member = await guild.fetchGuildMemberWrapperById(userId);

        if (guild.memberHasTrustedRole(member) === true || 
            guild.memberHasGameMasterRole(member) === true || 
            guild.memberIsOwner(userId) === true)
            guildData.push({ id, name });
    });

    await Promise.allSettled(promises);
    return guildData;
};

module.exports.getRecruitingCategoryId = (guildId) => guildDataStore.getRecruitingCategoryId(guildId);
module.exports.getBlitzRecruitingCategoryId = (guildId) => guildDataStore.getBlitzRecruitingCategoryId(guildId);
module.exports.getOngoingCategoryId = (guildId) => guildDataStore.getOngoingCategoryId(guildId);
module.exports.getBlitzCategoryId = (guildId) => guildDataStore.getBlitzCategoryId(guildId);

module.exports.hasGuildWrapper = (guildId) =>
{
    return guildWrappers[guildId] != null;
};

module.exports.forEachGuild = (fnToCall) =>
{
    for (let id in guildWrappers)
    {
        fnToCall(guildWrappers[id]);
    }
};

module.exports.forAllGuilds = (promiseToCall) =>
{
    return guildWrappers.forAllPromises((guildWrapper, index, arr) =>
    {
        return promiseToCall(guildWrapper, index, arr);
    });
};

module.exports.addGuild = (discordJsGuild) =>
{
    let guildWrapper = guildWrapperFactory.wrapDiscordJsGuild(discordJsGuild);
    let guildId = guildWrapper.getId();

    guildWrappers[guildId] = guildWrapper;
    return guildWrapper;
};

module.exports.removeGuild = (discordJsGuild) =>
{
    const guildId = discordJsGuild.id;
    delete guildWrappers[guildId];
    return guildDataStore.removeGuildData(guildId);
};

exports.deployBotOnGuild = async (client, guildId) =>
{
    let guildWrapper = this.getGuildWrapperById(guildId);

    let gameMasterRoleId = guildDataStore.getGameMasterRoleId(guildId);
    let trustedRoleId = guildDataStore.getTrustedRoleId(guildId);
    let blitzerRoleId = guildDataStore.getBlitzerRoleId(guildId);

    let newsChannelId = guildDataStore.getNewsChannelId(guildId);
    let helpChannelId = guildDataStore.getHelpChannelId(guildId);

    let recruitingCategoryId = guildDataStore.getRecruitingCategoryId(guildId);
    let ongoingCategoryId = guildDataStore.getOngoingCategoryId(guildId);


    const gameMasterRole = await guildWrapper.findOrCreateRole(
        gameMasterRoleId, 
        GuildSetup.gameMasterRoleOptions()
    );
    guildDataStore.setGameMasterRoleId(guildId, gameMasterRole.id);
    

    const trustedRole = await guildWrapper.findOrCreateRole(
        trustedRoleId, 
        GuildSetup.trustedRoleOptions()
    );
    guildDataStore.setTrustedRoleId(guildId, trustedRole.id);
    

    const blizerRole = await guildWrapper.findOrCreateRole(
        blitzerRoleId, 
        GuildSetup.blitzerRoleOptions()
    );
    guildDataStore.setBlitzerRoleId(guildId, blizerRole.id);
    
    
    const newsChannel = await guildWrapper.findOrCreateChannel(
        newsChannelId,
        GuildSetup.newsChannelOptions(guildId)
    );
    guildDataStore.setNewsChannelId(guildId, newsChannel.id);
    
    
    const helpChannel = await guildWrapper.findOrCreateChannel(
        helpChannelId,
        GuildSetup.helpChannelOptions(guildId)
    );
    guildDataStore.setHelpChannelId(guildId, helpChannel.id);
    
    
    const recruitingCategory = await guildWrapper.findOrCreateChannel(
        recruitingCategoryId,
        GuildSetup.recruitingCategoryOptions(guildId)
    );
    guildDataStore.setRecruitingCategoryId(guildId, recruitingCategory.id);
    
    
    const ongoingCategory = await guildWrapper.findOrCreateChannel(
        ongoingCategoryId,
        GuildSetup.ongoingCategoryOptions(guildId)
    );
    guildDataStore.setOngoingCategoryId(guildId, ongoingCategory.id);
};

exports.undeployBotOnGuild = (guildId) =>
{
    let guildWrapper = this.getGuildWrapperById(guildId);

    const newsChannel = guildWrapper.getNewsChannel();
    const helpChannel = guildWrapper.getHelpChannel();

    const recruitingCategory = guildWrapper.getRecruitingCategory();
    const blitzRecruitingCategory = guildWrapper.getBlitzRecruitingCategory();
    const ongoingCategory = guildWrapper.getOngoingCategory();
    const blitzCategory = guildWrapper.getBlitzCategory();

    const gameMasterRole = guildWrapper.getGameMasterRole();
    const trustedRole = guildWrapper.getTrustedRole();
    const blitzerRole = guildWrapper.getBlitzerRole();


    if (newsChannel != null)
    {
        newsChannel.delete()
        .catch((err) => log.error(log.getLeanLevel(), "COULD NOT DELETE NEWS CHANNEL", err));
    }

    if (helpChannel != null)
    {
        helpChannel.delete()
        .catch((err) => log.error(log.getLeanLevel(), "COULD NOT DELETE HELP CHANNEL", err));
    }

    if (recruitingCategory != null)
    {
        recruitingCategory.delete()
        .catch((err) => log.error(log.getLeanLevel(), "COULD NOT DELETE RECRUITING CATEGORY", err));
    }

    if (blitzRecruitingCategory != null)
    {
        blitzRecruitingCategory.delete()
        .catch((err) => log.error(log.getLeanLevel(), "COULD NOT DELETE BLITZ RECRUITING CATEGORY", err));
    }

    if (ongoingCategory != null)
    {
        ongoingCategory.delete()
        .catch((err) => log.error(log.getLeanLevel(), "COULD NOT DELETE GAME CATEGORY", err));
    }

    if (blitzCategory != null)
    {
        blitzCategory.delete()
        .catch((err) => log.error(log.getLeanLevel(), "COULD NOT DELETE BLITZ CATEGORY", err));
    }

    if (gameMasterRole != null)
    {
        gameMasterRole.delete()
        .catch((err) => log.error(log.getLeanLevel(), "COULD NOT DELETE GAME MASTER ROLE", err));
    }

    if (trustedRole != null)
    {
        trustedRole.delete()
        .catch((err) => log.error(log.getLeanLevel(), "COULD NOT DELETE TRUSTED ROLE", err));
    }

    if (blitzerRole != null)
    {
        blitzerRole.delete()
        .catch((err) => log.error(log.getLeanLevel(), "COULD NOT DELETE BLITZER ROLE", err));
    }

    return Promise.resolve();
};

exports.updateHelpChannels = (payload, idOfGuildToUpdate = "") =>
{
    let guildToUpdate = this.getGuildWrapperById(idOfGuildToUpdate);

    if (guildToUpdate != null)
        return guildToUpdate.updateHelpChannel(payload);

    return guildWrappers.forAllPromises((wrapper) =>
    {
        log.general(log.getNormalLevel(), `Updating guild ${wrapper.getName()}...`);

        return wrapper.updateHelpChannel(payload)
        .then(() => log.general(log.getNormalLevel(), `${wrapper.getName()} help channel updated.`))
        .catch((err) => log.error(log.getLeanLevel(), `ERROR UPDATING ${wrapper.getName()} HELP CHANNEL`, err));

    }, false);
};