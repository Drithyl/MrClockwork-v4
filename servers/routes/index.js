
const config = require("../../config/config.json");
const expressServer = require("../express_server.js");


exports.set = (expressApp) => 
{
    expressApp.get("/", (req, res) => 
    {
        if (req.secure === false && expressServer.isHttpsAvailable() === true)
            return res.redirect(config.fullSecureUrl);

        res.render("home_screen.ejs");
    });
};