const log = require("../../../logger.js");
const guildStore = require("../../guild_store.js");
const gameStore = require("../../../games/ongoing_games_store.js");

module.exports =
{
    name: "guildMemberUpdate",
    execute: async (oldMember, newMember) =>
    {
        log.general(log.getLeanLevel(), `GuildMember ${oldGuildMemberWrapper.getNameInGuild()} changed their guild nickname to ${newGuildMemberWrapper.getNameInGuild()}; updating game data...`);
        const guildWrapper = guildStore.getGuildWrapperById(oldMember.guild.id);
        const oldGuildMemberWrapper = await guildWrapper.fetchGuildMemberWrapperById(oldMember.id);
        const newGuildMemberWrapper = await guildWrapper.fetchGuildMemberWrapperById(newMember.id);

        const playerGames = gameStore.getGamesWhereUserIsPlayer(newGuildMemberWrapper.getId());
        const gamesToUpdate = playerGames.filter((game) => game.getGuildId() === newGuildMemberWrapper.getGuildId());

        gamesToUpdate.forEach((game) => game.updatePlayerUsername(newGuildMemberWrapper.getId(), newGuildMemberWrapper.getNameInGuild()));
        log.general(log.getLeanLevel(), `Player game data updated`);
    }
};