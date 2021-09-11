
const log = require("../../logger.js");
const dom5Nations = require("../../json/dom5_nations.json");
const webSessionsStore = require("../web_sessions_store.js");
const gameStore = require("../../games/ongoing_games_store.js");

exports.set = (expressApp) => 
{
    expressApp.get("/change_game_settings", (req, res) =>
    {
        var ongoingGames;
        const organizedGames = {};
        const session = webSessionsStore.getSessionFromUrlParams(req.url);

        if (session == null)
            return res.render("results_screen.ejs", { result: "Session does not exist." });

        const userId = session.getUserId();
        const sessionId = session.getSessionId();
        ongoingGames = gameStore.getGamesWhereUserIsOrganizer(userId);

        return ongoingGames.forAllPromises(async (game) =>
        {
            var hasGameStarted;
            var hostServer;
            var gameSettings;
            var maps;
            var mods;

            hasGameStarted = await game.checkIfGameStarted();
            
            log.general(log.getVerboseLevel(), `Has game started for settings change: ${hasGameStarted}`);

            if (hasGameStarted === true)
                return;

            hostServer = game.getServer();
            gameSettings = game.getSettingsObject();
            maps = await hostServer.getDom5MapsOnServer();
            mods = await hostServer.getDom5ModsOnServer();
                
            organizedGames[game.getName()] = { 
                serverName: hostServer.getName(), 
                settings: gameSettings.toEjsData(),
                maps,
                mods
            };
        })
        .then(() =>
        {
            log.general(log.getVerboseLevel(), "Final organized games data rendered", organizedGames);
            res.render("change_game_settings_screen.ejs", Object.assign({ 
                userId,
                sessionId,
                organizedGames: organizedGames, 
                nations: dom5Nations 
            }));
        })
        .catch((err) => res.render("results_screen.ejs", { result: `Error occurred while fetching game's data: ${err.message}` }));
    });

    expressApp.post("/change_game_settings", (req, res) =>
    {
        var game;
        const values = req.body;
        const sessionId = values.sessionId;
        const session = webSessionsStore.getSession(sessionId);

        log.general(log.getNormalLevel(), `change_game_settings POST values received`, values);

        if (session == null)
        {
            log.general(log.getNormalLevel(), "Session does not exist; cannot edit preferences.");
            return res.render("results_screen.ejs", { result: "Session does not exist." });
        }

        game = gameStore.getOngoingGameByName(values.gameName);

        _formatPostValues(values);

        return game.loadSettingsFromInput(values)
        .then(() =>
        {
            session.storeSessionData("Settings were changed.");
            session.redirectTo("result", res);
            return game.kill();
        })
        .then(() => game.launch())
        .catch((err) =>
        {
            log.error(log.getLeanLevel(), `CHANGE GAME SETTINGS ERROR:`, err);
            session.storeSessionData(`Error occurred while changing game settings: ${err.message}`);
            session.redirectTo("result", res);
        });
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