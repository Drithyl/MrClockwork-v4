
const config = require("../../config/config.json");
const expressServer = require("../express_server.js");
const guildStore = require("../../discord/guild_store.js");


exports.set = (expressApp) => 
{
    expressApp.get("/", (req, res) => 
    {
        if (req.secure === false && expressServer.isHttpsAvailable() === true)
            return res.redirect(config.fullSecureUrl);

        let guildCount = 0;
        let memberCount = 0;

        guildStore.forEachGuild((guildWrapper) =>
        {
            guildCount++;
            memberCount += guildWrapper.getMemberCount();
        });

        res.render("home_screen.ejs", {
            guildCount,
            memberCount
        });
    });
};