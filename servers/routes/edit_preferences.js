
const log = require("../../logger.js");
const assert = require("../../asserter.js");
const guildStore = require("../../discord/guild_store.js");
const webSessionsStore = require("../web_sessions_store.js");
const playerFileStore = require("../../player_data/player_file_store.js");
const DominionsPreferences = require("../../player_data/prototypes/dominions_preferences.js");

exports.set = (expressApp) => 
{
    expressApp.get("/edit_preferences", async (req, res) =>
    {
        var playerFile;
        var gamePreferences;
        var guildsWhereUserIsTrusted;

        const dataToSend = [];

        // Fetch session from either the URL params or the cookies, wherever we can find the sessionId
        const session = webSessionsStore.getSessionFromUrlParams(req) ?? webSessionsStore.getSessionFromCookies(req);

        if (session == null)
            return res.redirect("/authenticate");

        
        const userId = session.getUserId();
        const sessionId = session.getSessionId();

        try
        {
            guildsWhereUserIsTrusted = await guildStore.getGuildsWhereUserIsTrusted(userId);
            
            // User is in no guilds where the bot is present or where they are trusted
            if (guildsWhereUserIsTrusted.length <= 0)
                return res.render("results_screen.ejs", { result: `Sorry, your Discord account is not part of any guild in which Mr. Clockwork is present, or you do not have the Trusted role to use the bot in them.` });


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
        const formattedValues = _formatData(values);
        playerFile = playerFileStore.getPlayerFile(userId);
        
        _setPreferences(formattedValues, playerFile);
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



/** Turns a serialized data array into JSON. Required because the values of preferences
 *  need to be nested inside objects for each different game, thus why the form names have
 *  a "." separating the game's name and the actual preference key
 */
 function _formatData(data)
 {
    const formattedData = {};

    for (var key in data)
    {
        var value = data[key];

        if (assert.isNumber(+value) === true)
            value = +value;

        else if (/^on$/i.test(value) === true)
            value = true;

        else if (/^off$/i.test(value) === true)
            value = false;

        else if (assert.isArray(value) === true)
            value = value.map((reminderValue) => +reminderValue);

        if (/\./i.test(key) === true)
        {
            const gameName = key.split(".")[0];
            const valueKey = key.split(".")[1];

            if (formattedData[gameName] == null)
                formattedData[gameName] = {};

            // Single selections of reminders come in as 
            // string numbers rather than an array
            if (valueKey === "reminders" && assert.isArray(value) === false)
                formattedData[gameName][valueKey] = [ value ];

            else formattedData[gameName][valueKey] = value;
        }
    }

    log.general(log.getNormalLevel(), `edit_preferences formatted POST values`, formattedData);
 
    return formattedData;
 }

 function _setPreferences(preferencesByGame, playerFile)
 {
    const playerId = playerFile.getId();
    
    for (var gameName in preferencesByGame)
    {
        const preferencesData = Object.assign({ playerId }, preferencesByGame[gameName]);
        const preferencesObject = DominionsPreferences.loadFromJSON(preferencesData);
        playerFile.setGamePreferences(gameName, preferencesObject);
        log.general(log.getNormalLevel(), `Preferences for game ${gameName} set`);
    }
 }