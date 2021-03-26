
const config = require("../../config/config.json");


exports.set = (expressApp) => 
{
    expressApp.get("/", (req, res) => res.render("home_screen.ejs", {
        oAuth2Url: config.oAuth2Url
    }));
};