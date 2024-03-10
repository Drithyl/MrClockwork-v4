const log = require("../../../logger.js");
const guildStore = require("../../guild_store.js");
const gameStore = require("../../../games/ongoing_games_store.js");

module.exports =
{
    name: "guildMemberAdd",
    execute: async (member) =>
    {
        const guildWrapper = guildStore.getGuildWrapperById(member.guild.id);
        const guildMemberWrapper = await guildWrapper.fetchGuildMemberWrapperById(member.id);

        log.general(log.getLeanLevel(), `GuildMember ${guildMemberWrapper.getNameInGuild()} joined ${guildMemberWrapper.getGuildWrapper()?.getName()}; updating game data...`);

        const playerGames = gameStore.getGamesWhereUserIsPlayer(guildMemberWrapper.getId());
        const gamesToUpdate = playerGames.filter((game) => game.getGuildId() === guildMemberWrapper.getGuildId());

        gamesToUpdate.forEach((game) => game.updatePlayerUsername(guildMemberWrapper.getId(), guildMemberWrapper.getNameInGuild()));
        log.general(log.getLeanLevel(), `Player game data updated`);
    }
};