
const log = require("../../logger.js");
const webSessionsStore = require("../web_sessions_store.js");

const SCREEN_PATH = "results_screen.ejs";

exports.set = (expressApp) => 
{
    
    expressApp.get("/result", (req, res) =>
    {
        // Fetch session from either the URL params or the cookies, wherever we can find the sessionId
        const session = webSessionsStore.getSessionFromUrlParams(req) ?? webSessionsStore.getSessionFromCookies(req);

        if (session == null)
        {
            log.error(log.getLeanLevel(), "Session does not exist? Received data from previous endpoint:", sessionData);
            return res.render(SCREEN_PATH, { result: `A problem occurred; this user session could not be found. Your request might still have been fulfilled.` });
        }

        log.general(log.getNormalLevel(), `Connection ${req.ip} redirected here with sessionId ${session.getSessionId()}`);

        const data = session.getSessionData();

        if (data.sessionData == null)
        {
            log.error(log.getLeanLevel(), "Session exists, but no result was stored?");
            return res.render(SCREEN_PATH, { result: `Something might have gone wrong. Please check if your request was fulfilled correctly; result data was not found.` });
        }

        return res.render(SCREEN_PATH, { result: data.sessionData });
    });

};