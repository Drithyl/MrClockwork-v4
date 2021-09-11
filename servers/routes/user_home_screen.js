
const webSessionsStore = require("../web_sessions_store.js");


exports.set = (expressApp) => 
{
    expressApp.get("/user_home_screen", (req, res) =>
    {
        const session = webSessionsStore.getSessionFromUrlParams(req.url);

        if (session == null)
            return res.render("results_screen.ejs", { result: "Session does not exist!" });

        res.render("user_home_screen.ejs", session.getSessionData());
    });
};
