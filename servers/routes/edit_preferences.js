
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

        console.log("Host game authentication params:", sessionParams);

        if (webSessionsStore.isSessionValid(sessionParams) === false)
            return res.send("Session does not exist!");

        playerFile = playerFileStore.getPlayerFile(sessionParams.userId);
        gamePreferences = playerFile.getAllGamePreferences();

        gamePreferences.forEachItem((preferences, gameName) =>
        {
            dataToSend.push(Object.assign({ name: gameName }, preferences.getData()));
        });
        
        /** redirect to edit_preferences */
        res.render("edit_preferences.ejs", Object.assign(sessionParams, { gamePreferences: dataToSend }));
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
            return res.send("Session does not exist!");
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

        playerFile.save()
        .then(() => res.send("Preferences saved successfully."))
        .catch((err) => 
        {
            console.log(`Error saving preferences: ${err.message}`);
            res.send(`Error saving preferences: ${err.message}`);
        });
    });
};