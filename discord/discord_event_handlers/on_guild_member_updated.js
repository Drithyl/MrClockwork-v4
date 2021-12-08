
const log = require("../../logger.js");
const gameStore = require("../../games/ongoing_games_store.js");
const botClientWrapper = require("../wrappers/bot_client_wrapper.js");


exports.startListening = () =>
{
    log.general(log.getNormalLevel(), "Listening to onGuildMemberUpdate.");
    botClientWrapper.addOnGuildMemberUpdatedHandler((oldGuildMemberWrapper, newGuildMemberWrapper) =>
    {
        log.general(log.getLeanLevel(), `GuildMember ${oldGuildMemberWrapper.getNameInGuild()} changed their guild nickname to ${newGuildMemberWrapper.getNameInGuild()}; updating game data...`);
        const gamesToUpdate = gameStore.getGamesWhereUserIsPlayer(newGuildMemberWrapper.getId());
        gamesToUpdate.forEach((game) => game.updatePlayerUsername(newGuildMemberWrapper.getId(), newGuildMemberWrapper.getNameInGuild()));
        log.general(log.getLeanLevel(), `Player game data updated`);
    });
};