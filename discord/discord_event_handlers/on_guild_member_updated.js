
const log = require("../../logger.js");
const gameStore = require("../../games/ongoing_games_store.js");
const botClientWrapper = require("../wrappers/bot_client_wrapper.js");


exports.startListening = () =>
{
    log.general(log.getNormalLevel(), "Listening to onGuildMemberUpdate.");
    botClientWrapper.addOnGuildMemberUpdatedHandler((oldGuildMemberWrapper, newGuildMemberWrapper) =>
    {
        log.general(log.getLeanLevel(), `GuildMember ${oldGuildMemberWrapper.getNameInGuild()} changed their guild nickname to ${newGuildMemberWrapper.getNameInGuild()}; updating game data...`);
        const playerGames = gameStore.getGamesWhereUserIsPlayer(newGuildMemberWrapper.getId());
        const gamesToUpdate = playerGames.filter((game) => game.getGuildId() === newGuildMemberWrapper.getGuildId());
        gamesToUpdate.forEach((game) => game.updatePlayerUsername(newGuildMemberWrapper.getId(), newGuildMemberWrapper.getNameInGuild()));
        log.general(log.getLeanLevel(), `Player game data updated`);
    });
};