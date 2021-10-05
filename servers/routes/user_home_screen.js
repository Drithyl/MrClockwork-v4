
const webSessionsStore = require("../web_sessions_store.js");


exports.set = (expressApp) => 
{
    expressApp.get("/user_home_screen", (req, res) =>
    {
        // Fetch session from either the URL params or the cookies, wherever we can find the sessionId
        const session = webSessionsStore.getSessionFromUrlParams(req) ?? webSessionsStore.getSessionFromCookies(req);

        if (session == null)
            return res.render("results_screen.ejs", { result: "Session does not exist!" });

        res.render("user_home_screen.ejs", session.getSessionData());
    });
};
