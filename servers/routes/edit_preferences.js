
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

        console.log("Change preferences authentication params:", sessionParams);

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

        console.log(`Post values received:\n`, values);

        if (webSessionsStore.isSessionValid(values) === false)
        {
            console.log("Session does not exist; cannot edit preferences.");
            return res.render("../partials/result.ejs", { result: "Session does not exist." });
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

        console.log(`Saving new preferences for ${userId}...`);

        playerFile.save()
        .then(() => 
        {
            console.log("Preferences saved.");
            res.render("../partials/result.ejs", { result: "Preferences saved successfully." });
        })
        .catch((err) => 
        {
            console.log(`Error saving preferences: ${err.message}`);
            res.render("../partials/result.ejs", { result: `Error saving preferences: ${err.message}` });
        });
    });
};