
const log = require("../../logger.js");
const gameStore = require("../../games/ongoing_games_store.js");
const botClientWrapper = require("../wrappers/bot_client_wrapper.js");


exports.startListening = () =>
{
    log.general(log.getNormalLevel(), "Listening to onGuildMemberRemove.");
    botClientWrapper.addOnGuildMemberRemovedHandler((guildMemberWrapper) =>
    {
        log.general(log.getLeanLevel(), `GuildMember ${guildMemberWrapper.getNameInGuild()} left ${guildMemberWrapper.getGuildWrapper()?.getName()}; updating game data...`);
        const playerGames = gameStore.getGamesWhereUserIsPlayer(guildMemberWrapper.getId());
        const gamesToUpdate = playerGames.filter((game) => game.getGuildId() === guildMemberWrapper.getGuildId());
        gamesToUpdate.forEach((game) => game.updatePlayerLeftGuild(guildMemberWrapper.getId()));
        log.general(log.getLeanLevel(), `Player game data updated`);
    });
};