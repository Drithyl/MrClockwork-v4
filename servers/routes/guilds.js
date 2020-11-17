
const guildStore = require("../../discord/guild_store.js");


exports.set = (expressApp) => 
{
    expressApp.get("/guilds/:userId", (req, res) =>
    {
        var userId = req.params.userId;
        var availableGuilds = guildStore.getGuildClientData(userId);

        res.send(availableGuilds);
    });
};