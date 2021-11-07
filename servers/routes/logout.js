
const webSessionsStore = require("../web_sessions_store.js");


exports.set = (expressApp) => 
{
    expressApp.get("/logout", (req, res) =>
    {
        // Fetch session from either the URL params or the cookies, wherever we can find the sessionId
        const session = webSessionsStore.getSessionFromUrlParams(req) ?? webSessionsStore.getSessionFromCookies(req);

        if (session == null)
            return res.redirect("/");

        webSessionsStore.removeSession(session.getSessionId());
        return res.redirect("/");
    });
};