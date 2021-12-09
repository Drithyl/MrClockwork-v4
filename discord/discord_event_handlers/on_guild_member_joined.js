
const log = require("../../logger.js");
const gameStore = require("../../games/ongoing_games_store.js");
const botClientWrapper = require("../wrappers/bot_client_wrapper.js");


exports.startListening = () =>
{
    log.general(log.getNormalLevel(), "Listening to onGuildMemberJoined.");
    botClientWrapper.addOnGuildMemberJoinedHandler((guildMemberWrapper) =>
    {
        log.general(log.getLeanLevel(), `GuildMember ${guildMemberWrapper.getNameInGuild()} joined ${guildMemberWrapper.getGuildWrapper()?.getName()}; updating game data...`);
        const playerGames = gameStore.getGamesWhereUserIsPlayer(guildMemberWrapper.getId());
        const gamesToUpdate = playerGames.filter((game) => game.getGuildId() === guildMemberWrapper.getGuildId());
        gamesToUpdate.forEach((game) => game.updatePlayerUsername(guildMemberWrapper.getId(), guildMemberWrapper.getNameInGuild()));
        log.general(log.getLeanLevel(), `Player game data updated`);
    });
};