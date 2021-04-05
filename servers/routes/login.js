
const url = require("url");
const log = require("../../logger.js");
const oauth2 = require("../discord_oauth2.js");
const webSessionsStore = require("../web_sessions_store.js");


exports.set = (expressApp) => 
{
    expressApp.get("/login", (req, res) =>
    {
        const urlObject = new url.URL("http://www." + req.hostname + req.originalUrl);

        log.general(log.geVerboseLevel(), `Login request received with urlObject: ${urlObject.searchParams.get("code")}`);

        oauth2.authenticate(urlObject)
        .then((userInfo) => 
        {
            const userId = userInfo.id;
            const sessionToken = webSessionsStore.createSession(userId);

            if (userId == null)
                return log.general(log.getVerboseLevel(), "Invalid login attempt, ignoring.");

            log.general(log.getVerboseLevel(), `Request authenticated! userId: ${userId}, token: ${sessionToken}`);

            res.render("user_home_screen.ejs", { userData: {
                token: sessionToken, 
                userId 
            } });
        })
        .catch((err) => res.render("results_screen.ejs", { result: `Error occurred: ${err.message}` }));
    });
};