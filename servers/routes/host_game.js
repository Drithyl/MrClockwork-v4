
const log = require("../../logger.js");
const guildStore = require("../../discord/guild_store.js");
const hostServerStore = require("../host_server_store.js");
const dom5Nations = require("../../json/dom5_nations.json");
const webSessionsStore = require("../web_sessions_store.js");
const gamesStore = require("../../games/ongoing_games_store.js");
const Dominions5Game = require("../../games/prototypes/dominions5_game.js");

exports.set = (expressApp) => 
{
    //Get the params from the url itself instead of turning it into a route;
    //otherwise the route will act as the base path for which the host_game.html
    //file looks up the styling and js files, and will not find them. Must then
    //sendFile() as a return to preserve the URL that contains these parameters,
    //since they will also be extracted in the client
    expressApp.get("/host_game", async (req, res) =>
    {
        var availableServers;
        var guildsWhereUserIsMember;

        const guildData = [];

        // Fetch session from either the URL params or the cookies, wherever we can find the sessionId
        const session = webSessionsStore.getSessionFromUrlParams(req) ?? webSessionsStore.getSessionFromCookies(req);

        if (session == null)
            return res.redirect("/authenticate");

        const userId = session.getUserId();
        const sessionId = session.getSessionId();
        availableServers = hostServerStore.getAvailableServersClientData();
        guildsWhereUserIsMember = await guildStore.getGuildsWhereUserIsMember(userId);

        guildsWhereUserIsMember.forEach((wrapper) =>
        {
            guildData.push({
                id: wrapper.getId(),
                name: wrapper.getName()
            });
        });
        
        /** redirect to host_game */
        res.render("host_game_screen.ejs", {
            userId,
            sessionId,
            guilds: guildData, 
            servers: availableServers,
            nations: dom5Nations
        });
    });

    expressApp.post("/host_game", (req, res) =>
    {
        const values = req.body;

        // Fetch session from either the URL params or the cookies, wherever we can find the sessionId
        const session = webSessionsStore.getSessionFromBody(req) ?? webSessionsStore.getSessionFromCookies(req);

        log.general(log.getNormalLevel(), `host_game POST values received`, values);

        if (session == null)
        {
            log.general(log.getNormalLevel(), "Session does not exist; cannot host.");
            return res.render("results_screen.ejs", { result: `Session does not exist.` });
        }

        const userId = session.getUserId();
        _formatPostValues(values);

        _createGame(userId, values)
        .then((game) => 
        {
            session.storeSessionData("Game has been hosted! Find the corresponding channel in the selected Discord guild.");
            session.redirectTo("result", res);
            return game.launch();
        })
        .catch((err) => 
        {
            log.error(log.getLeanLevel(), `HOST GAME ERROR`, err);
            session.storeSessionData(`Error occurred while creating the game. It might still have been created successfully: ${err.message}`);
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

    log.general(log.getNormalLevel(), `host_game formatted POST values`, values);
    return values;
}

function _createGame(userId, values)
{
    var gameObject;
    const guild = guildStore.getGuildWrapperById(values.guild);
    const server = hostServerStore.getHostServerByName(values.server);

    if (server == null || server.isOnline() === false)
        return Promise.reject(new Error(`Selected server is offline; cannot host game.`));

    gameObject = new Dominions5Game();
    gameObject.setGuild(guild);
    gameObject.setServer(server);

    return guild.fetchGuildMemberWrapperById(userId)
    .then((memberWrapper) =>
    {
        gameObject.setOrganizer(memberWrapper);
        return server.reserveGameSlot();
    })
    .then((port) =>
    {
        gameObject.setPort(port);
        return gameObject.loadSettingsFromInput(values);
    })
    .then(() => gamesStore.addOngoingGame(gameObject))
    .then(() => gameObject.createNewChannel())
    .then(() => gameObject.createNewRole())
    .then(() => gameObject.pinSettingsToChannel())
    .then(() => gameObject.save())
    .then(() => log.general(log.getNormalLevel(), `Game ${gameObject.getName()} was created successfully.`))
    .then(() => Promise.resolve(gameObject))
    .catch((err) =>
    {
        log.error(log.getLeanLevel(), `ERROR when creating ${gameObject.getName()} through web. Cleaning it up`, err);
        
        if (gameObject == null)
            return Promise.reject(err);

        return gameObject.deleteGame()
        .then(() => gameObject.deleteRole())
        .then(() => gameObject.deleteChannel())
        .then(() => Promise.reject(err));
    });
}