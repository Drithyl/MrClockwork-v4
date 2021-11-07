
const log = require("../../logger.js");
const webSessionsStore = require("../web_sessions_store.js");
const playerFileStore = require("../../player_data/player_file_store.js");
const DominionsPreferences = require("../../player_data/prototypes/dominions_preferences.js");

exports.set = (expressApp) => 
{
    expressApp.get("/edit_preferences", (req, res) =>
    {
        var playerFile;
        var gamePreferences;
        const dataToSend = [];

        // Fetch session from either the URL params or the cookies, wherever we can find the sessionId
        const session = webSessionsStore.getSessionFromUrlParams(req) ?? webSessionsStore.getSessionFromCookies(req);

        if (session == null)
            return res.redirect("/authenticate");

        
        const userId = session.getUserId();
        const sessionId = session.getSessionId();
        
        try
        {
            playerFile = playerFileStore.getPlayerFile(userId);
            gamePreferences = playerFile.getAllGamePreferences();

            gamePreferences.forEachItem((preferences, gameName) =>
            {
                dataToSend.push(Object.assign({ name: gameName }, preferences.getData()));
            });
            
            /** redirect to edit_preferences */
            res.render("edit_preferences_screen.ejs", Object.assign({ 
                userId,
                sessionId,
                gamePreferences: dataToSend 
            }));
        }

        catch(err)
        {
            if (err.name === "InvalidDiscordIdError")
                res.render("results_screen.ejs", { result: "Session expired or Discord ID is invalid." });

            else res.render("results_screen.ejs", { result: err.message });
        }
        
    });

    expressApp.post("/edit_preferences", (req, res) =>
    {
        var playerFile;
        const values = req.body;

        // Fetch session from either the URL params or the cookies, wherever we can find the sessionId
        const session = webSessionsStore.getSessionFromBody(req) ?? webSessionsStore.getSessionFromCookies(req);

        log.general(log.getNormalLevel(), `edit_preferences POST values received`, values);

        if (session == null)
        {
            log.general(log.getNormalLevel(), "Session does not exist; cannot edit preferences.");
            return res.render("../partials/results_screen.ejs", { result: "Session does not exist." });
        }

        const userId = session.getUserId();
        playerFile = playerFileStore.getPlayerFile(userId);


        for (var gameName in values)
        {
            const preferencesData = Object.assign({ playerId: userId }, values[gameName]);
            const gamePreferences = DominionsPreferences.loadFromJSON(preferencesData);

            playerFile.setGamePreferences(gameName, gamePreferences);
        }

        log.general(log.getNormalLevel(), `Saving new preferences for ${userId}...`);

        playerFile.save()
        .then(() => 
        {
            log.general(log.getNormalLevel(), "Preferences saved.");
            session.storeSessionData("Preferences saved successfully.");
            session.redirectTo("result", res);
        })
        .catch((err) => 
        {
            log.error(log.getLeanLevel(), `ERROR SAVING PREFERENCES FOR USER ${userId}`, err);
            session.storeSessionData(`Error saving preferences: ${err.message}`);
            session.redirectTo("result", res);
        });
    });
};