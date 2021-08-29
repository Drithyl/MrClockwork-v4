
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
        const sessionParams = webSessionsStore.extractSessionParamsFromUrl(req.url);

        log.general(log.getNormalLevel(), "edit_preferences authentication params", sessionParams);

        if (webSessionsStore.isSessionValid(sessionParams) === false)
            return res.render("results_screen.ejs", { result: `Session does not exist.` });

        try
        {
            playerFile = playerFileStore.getPlayerFile(sessionParams.userId);
            gamePreferences = playerFile.getAllGamePreferences();

            gamePreferences.forEachItem((preferences, gameName) =>
            {
                dataToSend.push(Object.assign({ name: gameName }, preferences.getData()));
            });
            
            /** redirect to edit_preferences */
            res.render("edit_preferences_screen.ejs", Object.assign(sessionParams, { gamePreferences: dataToSend }));
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
        const values = req.body;
        const userId = webSessionsStore.getSessionUserId(values.token);
        var playerFile;

        log.general(log.getNormalLevel(), `edit_preferences POST values received`, values);

        if (webSessionsStore.isSessionValid(values) === false)
        {
            log.general(log.getNormalLevel(), "Session does not exist; cannot edit preferences.");
            return res.render("../partials/results_screen.ejs", { result: "Session does not exist." });
        }

        playerFile = playerFileStore.getPlayerFile(userId);

        webSessionsStore.removeSession(values.token);
        delete values.token;

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
            res.render("../partials/results_screen.ejs", { result: "Preferences saved successfully." });
        })
        .catch((err) => 
        {
            log.error(log.getLeanLevel(), `ERROR SAVING PREFERENCES FOR USER ${userId}`, err);
            res.render("../partials/results_screen.ejs", { result: `Error saving preferences: ${err.message}` });
        });
    });
};