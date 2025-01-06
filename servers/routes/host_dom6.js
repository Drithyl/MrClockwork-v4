
const log = require("../../logger.js");
const config = require("../../config/config.json");
const guildStore = require("../../discord/guild_store.js");
const hostServerStore = require("../host_server_store.js");
const dom6Nations = require("../../json/dom6_nations.json");
const webSessionsStore = require("../web_sessions_store.js");
const gamesStore = require("../../games/ongoing_games_store.js");
const DominionsGame = require("../../games/prototypes/dominions_game.js");
const triggerOnGameCreatedEvent = require("../../games/event_handlers/game_created.js");

exports.set = (expressApp) => 
{
    //Get the params from the url itself instead of turning it into a route;
    //otherwise the route will act as the base path for which the host_game.html
    //file looks up the styling and js files, and will not find them. Must then
    //sendFile() as a return to preserve the URL that contains these parameters,
    //since they will also be extracted in the client
    expressApp.get("/host_dom6", async (req, res) =>
    {
        let guildsWhereUserIsTrusted;

        const guildData = [];

        // Fetch session from either the URL params or the cookies, wherever we can find the sessionId
        const session = webSessionsStore.getSessionFromUrlParams(req) ?? webSessionsStore.getSessionFromCookies(req);

        if (session == null)
            return res.redirect("/authenticate");

        const userId = session.getUserId();
        const sessionId = session.getSessionId();
        const maps = await hostServerStore.getMapsWithProvCount(config.dom6GameTypeName);
        const mods = await hostServerStore.getMods(config.dom6GameTypeName);
        guildsWhereUserIsTrusted = await guildStore.getGuildsWhereUserIsTrusted(userId);
        
        
        // User is in no guilds where the bot is present or where they are trusted
        if (guildsWhereUserIsTrusted.length <= 0)
            return res.render("results_screen.ejs", { result: `Sorry, your Discord account is not part of any guild in which Mr. Clockwork is present, or you do not have the Trusted role to use the bot in them.` });


        guildsWhereUserIsTrusted.forEach((wrapper) =>
        {
            guildData.push({
                id: wrapper.getId(),
                name: wrapper.getName()
            });
        });


        /** redirect to host_game */
        res.render("host_dom6_screen.ejs", {
            userId,
            sessionId,
            guilds: guildData,
            nations: dom6Nations,
            maps,
            mods
        });
    });

    expressApp.post("/host_dom6", (req, res) =>
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
            session.storeSessionData(`Game has been hosted at IP ${game.getIp()}:${game.getPort()}! Find the corresponding channel in the selected Discord guild.`);
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


    values.thrones = `${+values.level1Thrones}, ${+values.level2Thrones}, ${+values.level3Thrones}`;
    values.timer = `${+values.timerDays}d${+values.timerHours}h${+values.timerMinutes}m`;

    log.general(log.getNormalLevel(), `host_game formatted POST values`, values);
    return values;
}

function _createGame(userId, values)
{
    let gameObject;
    const gameName = values.name;
    const guild = guildStore.getGuildWrapperById(values.guild);
    const gameServer = hostServerStore.getOnlineServerWithMostSlots();
    const type = config.dom6GameTypeName;

    if (gameServer == null || gameServer.isOnline() === false)
        return Promise.reject(new Error(`No server is available; cannot host the game at this time.`));

    gameObject = new DominionsGame(type);
    gameObject.setGuild(guild);
    gameObject.setServer(gameServer);
    log.general(log.getNormalLevel(), `Game ${gameName} will be hosted on ${gameServer.getName()} server`);

    return guild.fetchGuildMemberWrapperById(userId)
    .then((memberWrapper) =>
    {
        gameObject.setOrganizer(memberWrapper);
        return gameServer.reserveGameSlot();
    })
    .then((port) =>
    {
        gameObject.setPort(port);
        return gameObject.loadSettingsFromInput(values);
    })
    .then(() => gameObject.createChannel())
    .then(() => gameObject.createRole())
    .then(() => gamesStore.addOngoingGame(gameObject))
    .then(() => triggerOnGameCreatedEvent(gameObject))
    .then(() => gameObject.save())
    .then(() => gameObject.launch())
    .then(() => log.general(log.getNormalLevel(), `Game ${gameName} was created successfully.`))
    .then(() => Promise.resolve(gameObject))
    .catch((err) =>
    {
        if (gameObject == null)
            return Promise.reject(err);

        return gameObject.deleteGame()
        .then(() => gameObject.deleteRole())
        .then(() => gameObject.deleteChannel())
        .catch((cleaningError) =>
        {
            // Log in case there was an error while cleaning the game
            log.error(log.getLeanLevel(), `ERROR when cleaning ${gameName} after hosting error`, cleaningError);
        })
        // Reject with original hosting error, as this is the one that will be shown to user
        .then(() => Promise.reject(err));
    });
}