
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

        let oAuth2Url = `https://discord.com/api/oauth2/authorize?client_id=${config.discordClientId}&redirect_uri=${config.discordRedirectUri}&response_type=code&scope=identify&prompt=none`
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

            if (userInfo.error != null || userInfo.code != null)
                return _handleLoginError(userInfo, res);

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

function _handleLoginError(info, res)
{
    if (/You are being blocked from accessing our API temporarily/i.test(info.message) === true)
        return res.render("results_screen.ejs", { result: `There are too many requests right now. Please try again later.` });
        
    if (/401: Unauthorized/i.test(info.message) === true)
        return res.render("results_screen.ejs", { result: `Incorrect login or password provided.` });
        
    if (/invalid_request/i.test(info.error) === true)
        return res.render("results_screen.ejs", { result: `Invalid code in request.` });

    if (info.message != null)
        return res.render("results_screen.ejs", { result: info.message });

    if (info.error != null)
        return res.render("results_screen.ejs", { result: `Error occurred: ${info.error}.` });

    else return res.render("results_screen.ejs", { result: `Unknown Error occurred.` });
}