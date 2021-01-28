
const url = require("url");
const oauth2 = require("../discord_oauth2.js");
const webSessionsStore = require("../web_sessions_store.js");


exports.set = (expressApp) => 
{
    expressApp.get("/login", (req, res) =>
    {
        const urlObject = url.parse(req.url, true);

        console.log("Login request received with urlObject: " + urlObject.query.code);

        oauth2.authenticate(urlObject)
        .then((userInfo) => 
        {
            const userId = userInfo.id;
            const sessionToken = webSessionsStore.createSession(userId);

            if (userId == null)
                return console.log("Invalid login attempt, ignoring.");

            console.log(`Authenticated! userId: ${userId}, token: ${sessionToken}`);

            res.render("user_home_screen.ejs", { userData: {
                token: sessionToken, 
                userId 
            } });
        })
        .catch((err) => res.render("results_screen.ejs", { result: `Error occurred: ${err.message}` }));
    });
};