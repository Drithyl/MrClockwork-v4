
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
        
        const sessionParams = webSessionsStore.extractSessionParamsFromUrl(req.url);

        log.general(log.getNormalLevel(), "change_game_settings authentication params", sessionParams);

        if (webSessionsStore.isSessionValid(sessionParams) === false)
            return res.render("results_screen.ejs", { result: "Session does not exist." });

        ongoingGames = gameStore.getGamesWhereUserIsOrganizer(sessionParams.userId);

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
            res.render("change_game_settings_screen.ejs", Object.assign(sessionParams, { organizedGames: organizedGames, nations: dom5Nations }));
        })
        .catch((err) => res.render("change_game_settings_screen.ejs", Object.assign(sessionParams, { error: `Error occurred while fetching game's data: ${err.message}` })));
    });

    expressApp.post("/change_game_settings", (req, res) =>
    {
        var game;
        const values = req.body;

        log.general(log.getNormalLevel(), `change_game_settings POST values received`, values);

        if (webSessionsStore.isSessionValid(values) === false)
        {
            log.general(log.getNormalLevel(), "Session does not exist; cannot edit preferences.");
            return res.render("results_screen.ejs", { result: "Session does not exist." });
        }

        webSessionsStore.removeSession(values.token);
        game = gameStore.getOngoingGameByName(values.gameName);

        _formatPostValues(values);

        return game.loadSettingsFromInput(values)
        .then(() =>
        {
            res.render("results_screen.ejs", { result: "Settings were changed." });
            return game.kill();
        })
        .then(() => game.launch())
        .catch((err) => log.general(log.getNormalLevel(), err));
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