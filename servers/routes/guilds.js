
const guildStore = require("../../discord/guild_store.js");


exports.set = (expressApp) => 
{
    expressApp.get("/guilds/:userId", (req, res) =>
    {
        var userId = req.params.userId;
        
        return guildStore.fetchGuildClientData(userId)
        .then((availableGuilds) => res.send(availableGuilds));
    });
};