const log = require("../../../logger.js");
const guildStore = require("../../guild_store.js");
const gameStore = require("../../../games/ongoing_games_store.js");

module.exports =
{
    name: "guildMemberRemove",
    execute: async (member) =>
    {
        log.general(log.getLeanLevel(), `GuildMember ${guildMemberWrapper.getNameInGuild()} left ${guildMemberWrapper.getGuildWrapper()?.getName()}; updating game data...`);
        const guildWrapper = guildStore.getGuildWrapperById(member.guild.id);
        const guildMemberWrapper = await guildWrapper.fetchGuildMemberWrapperById(member.id);

        const playerGames = gameStore.getGamesWhereUserIsPlayer(guildMemberWrapper.getId());
        const gamesToUpdate = playerGames.filter((game) => game.getGuildId() === guildMemberWrapper.getGuildId());

        gamesToUpdate.forEach((game) => game.updatePlayerLeftGuild(guildMemberWrapper.getId()));
        log.general(log.getLeanLevel(), `Player game data updated`);
    }
};