
const webSessionsStore = require("../web_sessions_store.js");
const playerFileStore = require("../../player_data/player_file_store.js");

exports.set = (expressApp) => 
{
    expressApp.get("/edit_preferences", (req, res) =>
    {
        var playerFile;
        var gameData;
        var globalPreferences;
        const dataToSend = [];
        const sessionParams = webSessionsStore.extractSessionParamsFromUrl(req.url);

        console.log("Host game authentication params:", sessionParams);

        if (webSessionsStore.isSessionValid(sessionParams) === false)
            return res.send("Session does not exist!");

        playerFile = playerFileStore.getPlayerFile(sessionParams.userId);
        globalPreferences = playerFile.getGlobalPreferences();
        gameData = playerFile.getAllGameData();

        dataToSend.push(Object.assign({ name: "global" }, globalPreferences.getData()));

        gameData.forEach((gameData) =>
        {
            const gameName = gameData.getGameName();
            const preferences = gameData.getDominionsPreferences();
            dataToSend.push(Object.assign({ name: gameName }, preferences.getData()));
        });

        console.log(dataToSend);
        
        /** redirect to edit_preferences */
        res.render("edit_preferences.ejs", Object.assign(sessionParams, { gamePreferences: dataToSend }));
    });

    expressApp.post("/edit_preferences", (req, res) =>
    {
        const values = req.body;
        var playerFile;

        console.log(`Post values received:\n`, values);

        if (webSessionsStore.isSessionValid(values) === false)
        {
            console.log("Session does not exist; cannot edit preferences.");
            return res.send("Session does not exist!");
        }

        playerFile = webSessionsStore.getSessionData(values.userId);
        webSessionsStore.removeSession(values.userId);
    });
};