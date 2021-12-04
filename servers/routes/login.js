
const url = require("url");
const log = require("../../logger.js");
const oauth2 = require("../discord_oauth2.js");
const config = require("../../config/config.json");
const webSessionsStore = require("../web_sessions_store.js");


exports.set = (expressApp) => 
{
    expressApp.get("/authenticate", (req, res) =>
    {
        const session = webSessionsStore.getSessionFromUrlParams(req) ?? webSessionsStore.getSessionFromCookies(req);

        if (session != null)
            return session.redirectTo("user_home_screen", res);

        var oAuth2Url = `https://discord.com/api/oauth2/authorize?client_id=${config.discordClientId}&redirect_uri=${config.discordRedirectUri}&response_type=code&scope=identify&prompt=none`
        res.redirect(oAuth2Url);
    });


    expressApp.get("/login", (req, res) =>
    {
        const urlObject = new url.URL("http://www." + req.hostname + req.originalUrl);
        const session = webSessionsStore.getSessionFromUrlParams(req) ?? webSessionsStore.getSessionFromCookies(req);
        log.general(log.getVerboseLevel(), `Login request received with urlObject: ${urlObject.searchParams.get("code")}`);

        if (session != null)
            return session.redirectTo("user_home_screen", res);

        oauth2.authenticate(urlObject)
        .then((userInfo) => 
        {
            const userId = userInfo.id;

            if (userId == null)
                return log.general(log.getVerboseLevel(), "Invalid login attempt, ignoring.");

            const session = webSessionsStore.createSession(userId);
            const sessionId = session.getSessionId();
            res.cookie("sessionId", sessionId);
            log.general(log.getVerboseLevel(), `Request authenticated! userId: ${userId}, sessionId: ${sessionId}, cookie set`);

            session.redirectTo("user_home_screen", res);
        })
        .catch((err) => res.render("results_screen.ejs", { result: `Error occurred: ${err.message}` }));
    });
};