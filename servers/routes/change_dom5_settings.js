
const log = require("../../logger.js");
const asserter = require("../../asserter.js");
const config = require("../../config/config.json");
const hostServerStore = require("../host_server_store.js");
const dom5Nations = require("../../json/dom5_nations.json");
const webSessionsStore = require("../web_sessions_store.js");
const gameStore = require("../../games/ongoing_games_store.js");

exports.set = (expressApp) => 
{
    expressApp.get("/change_dom5_settings", async (req, res) =>
    {
        let ongoingGames;
        const organizedGames = {};

        // Fetch session from either the URL params or the cookies, wherever we can find the sessionId
        const session = webSessionsStore.getSessionFromUrlParams(req) ?? webSessionsStore.getSessionFromCookies(req);

        if (session == null)
            return res.redirect("/authenticate");

        const userId = session.getUserId();
        const sessionId = session.getSessionId();
        ongoingGames = gameStore.getGamesWhereUserIsOrganizer(userId);

        try {
            for (const game of ongoingGames) {
                let hostServer;
                let gameSettings;
    
                hostServer = game.getServer();
    
                if (asserter.isDom6GameType(game.getType()) === true)
                    continue;
    
                if (hostServer.isOnline() === false)
                    continue;
    
                if (game.hasGameStarted() === true)
                    continue;
    
                gameSettings = game.getSettingsObject();
                    
                organizedGames[game.getName()] = { 
                    serverName: hostServer.getName(), 
                    settings: gameSettings.toEjsData()
                };
            }
    
            const maps = await hostServerStore.getMapsWithProvCount(config.dom5GameTypeName);
            const mods = await hostServerStore.getMods(config.dom5GameTypeName);
    
            log.general(log.getVerboseLevel(), "Final organized dom5 games data rendered", organizedGames);
            res.render("change_dom5_settings_screen.ejs", Object.assign({ 
                userId,
                sessionId,
                organizedGames: organizedGames, 
                nations: dom5Nations,
                maps,
                mods
            }));
        }

        catch(err) {
            res.render("results_screen.ejs", { result: `Error occurred while fetching dom5 games' data: ${err.message}` });
        }
    });

    expressApp.post("/change_dom5_settings", async (req, res) =>
    {
        let game;
        let settingsObject;
        let changeableSettingsArray;
        const values = req.body;

        // Fetch session from either the URL params or the cookies, wherever we can find the sessionId
        const session = webSessionsStore.getSessionFromBody(req) ?? webSessionsStore.getSessionFromCookies(req);

        log.general(log.getNormalLevel(), `change_game_settings POST values received`, values);

        if (session == null)
        {
            log.general(log.getNormalLevel(), "Session does not exist; cannot edit preferences.");
            return res.render("results_screen.ejs", { result: "Session does not exist." });
        }

        game = gameStore.getOngoingGameByName(values.name, config.dom6GameTypeName);
        settingsObject = game.getSettingsObject();
        changeableSettingsArray = settingsObject.getChangeableSettings();

        _formatPostValues(values);

        try {
            for (const setting of changeableSettingsArray) {
                let key = setting.getKey();
                let loadedValue = values[key];
    
                if (loadedValue == undefined)
                    throw new Error(`Change settings: Expected value for setting ${key} is undefined.`);
    
                await setting.setValue(loadedValue);
            }
    
            session.storeSessionData("Settings were changed.");
            session.redirectTo("result", res);
            
            // Delete ftherlnd so that some settings that get
            // encoded in it (like maps) are cleared properly
            await game.overwriteSettings();
            await game.save();
            await game.kill();
            await game.launch();
        }
        
        catch(err) {
            log.error(log.getLeanLevel(), `CHANGE GAME SETTINGS ERROR:`, err);
            session.storeSessionData(`Error occurred while changing dom5 game settings: ${err.message}`);
            session.redirectTo("result", res);
        }
    });
};

function _formatPostValues(values)
{
    //format aiNations as the setting expects it
    if (values.aiNations == null)
    values.aiNations = "none";

    else if (Array.isArray(values.aiNations) === true)
        values.aiNations = values.aiNations.join(",");


    //format mods as the setting expects it
    if (values.mods == null)
        values.mods = "none";

    else if (Array.isArray(values.mods) === true)
        values.mods = values.mods.join(",");


    values.thrones = `${values.level1Thrones}, ${values.level2Thrones}, ${values.level3Thrones}`;
    values.timer = `${values.timerDays}d${values.timerHours}h${values.timerMinutes}m`;

    log.general(log.getNormalLevel(), `change_game_settings formatted POST values`, values);
    return values;
}