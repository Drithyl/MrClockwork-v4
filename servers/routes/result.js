
const log = require("../../logger.js");
const webSessionsStore = require("../web_sessions_store.js");

const SCREEN_PATH = "results_screen.ejs";

exports.set = (expressApp) => 
{
    
    expressApp.get("/result", (req, res) =>
    {
        const sessionData = req.query;
        const sessionToken = sessionData.token;
        const result = webSessionsStore.getSessionResult(sessionToken);

        log.general(log.getNormalLevel(), `Connection ${req.ip} redirected here with token ${sessionToken}`);

        if (webSessionsStore.isSessionValid(sessionData) === false)
        {
            log.error(log.getLeanLevel(), "Session does not exist? Received data from previous endpoint:", sessionData);
            return res.render(SCREEN_PATH, { result: `A problem occurred; this user session could not be found. Your request might still have been fulfilled.` });
        }

        if (result == null)
        {
            log.error(log.getLeanLevel(), "Session exists, but no result was stored?");
            return res.render(SCREEN_PATH, { result: `Something might have gone wrong. Please check if your request was fulfilled correctly; result data was not found.` });
        }

        return res.render(SCREEN_PATH, { result });
    });

};