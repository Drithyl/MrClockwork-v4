
const guildStore = require("../../discord/guild_store.js");
const hostServerStore = require("../host_server_store.js");
const webSessionsStore = require("../web_sessions_store.js");
const Dominions5Game = require("../../games/prototypes/dominions5_game.js");

exports.set = (expressApp) => 
{
    //Get the params from the url itself instead of turning it into a route;
    //otherwise the route will act as the base path for which the host_game.html
    //file looks up the styling and js files, and will not find them. Must then
    //sendFile() as a return to preserve the URL that contains these parameters,
    //since they will also be extracted in the client
    expressApp.get("/host_game", (req, res) =>
    {
        var availableServers;
        var guildsWhereUserIsMember;

        const guildData = [];
        const sessionParams = webSessionsStore.extractSessionParamsFromUrl(req.url);

        console.log("Host game authentication params:", sessionParams);

        if (webSessionsStore.isSessionValid(sessionParams) === false)
            return res.send("Session does not exist!");

        availableServers = hostServerStore.getAvailableServers();
        guildsWhereUserIsMember = guildStore.getGuildsWhereUserIsMember(sessionParams.userId);

        guildsWhereUserIsMember.forEach((wrapper) =>
        {
            guildData.push({
                id: wrapper.getId(),
                name: wrapper.getName()
            });
        });
        
        /** redirect to host_game */
        res.render("host_game.ejs", Object.assign(sessionParams, {
            guilds: guildData, 
            servers: availableServers
        }));
    });

    expressApp.post("/host_game", (req, res) =>
    {
        const values = req.body;
        const sessionToken = values.token;
        const userId = webSessionsStore.getSessionUserId(values.token);

        console.log(`Post values received:\n`, values);

        if (webSessionsStore.isSessionValid(values) === false)
        {
            console.log("Session does not exist; cannot host.");
            return res.send("Session does not exist!");
        }

        webSessionsStore.removeSession(sessionToken);
        _formatPostValues(values);

        _createGame(userId, values)
        .then(() => 
        {
            res.send("Game has been hosted! Find the corresponding channel in the selected Discord guild.");
            return Promise.resolve();
        })
        .catch((err) => 
        {
            console.log(err);
            res.send(`Error occurred when creating the game: ${err.message}`);
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

    console.log(`\nFormatted POST values:\n`, values);
    return values;
}

function _createGame(userId, values)
{
    var gameObject;
    const guild = guildStore.getGuildWrapperById(values.guild);
    const organizer = guild.getGuildMemberWrapperById(userId);
    const server = hostServerStore.getHostServerByName(values.server);

    if (server == null || server.isOnline() === false)
        return Promise.reject(new Error(`Selected server is offline; cannot host game.`));

    gameObject = new Dominions5Game();
    gameObject.setOrganizer(organizer);
    gameObject.setGuild(guild);
    gameObject.setServer(server);

    return server.reserveGameSlot()
    .then((port) =>
    {
        gameObject.setPort(port);
        return gameObject.loadSettingsFromInput(values);
    })
    .then(() => gameObject.createNewChannel())
    .then(() => gameObject.createNewRole())
    .then(() => gameObject.pinSettingsToChannel())
    .then(() => gameObject.finishGameCreation())
    .then(() => Promise.resolve(gameObject));
}