
const log = require("../../logger.js");
const guildStore = require("../guild_store.js");
const v3GuildDataImporter = require("../v3_guild_data_importer.js");
const botClientWrapper = require("../wrappers/bot_client_wrapper.js");


exports.startListening = () =>
{
    log.general(log.getNormalLevel(), "Listening to onJoinedGuild.");
    botClientWrapper.addOnBotJoinedGuildHandler(_onJoinedGuild);
};

function _onJoinedGuild(discordJsGuild)
{
    const guildWrapper = guildStore.addGuild(discordJsGuild);

    // Try to import guild data from the v3 bot
    v3GuildDataImporter.importV3GuildData(guildWrapper.getId());

    //TODO: message guild owner about the deploy command
}