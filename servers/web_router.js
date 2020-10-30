
const _path = require('path');
const guildStore = require("../discord/guild_store.js");
const hostServerStore = require("./host_server_store.js");
const hostingSessionsStore = require("./hosting_sessions_store.js");

exports.setMiddlewares = (expressApp, express) =>
{
    //Set the middleware used to handle incoming HTTP requests.
    //static() will serve all files within the provided directory, including css or js
    expressApp.use(express.static(_path.join(__dirname + "/../client")));
    expressApp.use(express.static(_path.join(__dirname + "/../shared")));
    expressApp.use(express.json());
    expressApp.use(express.urlencoded());
};

exports.setRoutes = (expressApp) =>
{
    //default URL for website, handle incoming requests on root page
    expressApp.get("/", (req, res) =>
    {
        var indexPath = _path.join(__dirname + "/../client/index.html");
        res.sendFile(indexPath);
    });

    //Get the params from the url itself instead of turning it into a route;
    //otherwise the route will act as the base path for which the host_game.html
    //file looks up the styling and js files, and will not find them. Must then
    //sendFile() as a return to preserve the URL that contains these parameters,
    //since they will also be extracted in the client
    expressApp.get("/host_game", (req, res) =>
    {
        var params = req.url.replace("/host_game?", "");
        var userId = params.replace(/userId=(\d+)&token.+/i, "$1");
        var token = params.replace(/^.+&token=/i, "");

        console.log("Host game authentication params:", userId, token);

        if (hostingSessionsStore.doesSessionExist(userId, token) === true)
        {
            var hostGamePath = _path.join(__dirname + "/../client/host_game.html");
            return res.sendFile(hostGamePath);
        }

        else return res.send("Session does not exist!");
    });

    expressApp.post("/host_game", (req, res) =>
    {
        const values = req.body;
        const guildStore = require("../discord/guild_store.js");
        const hostServerStore = require("../servers/host_server_store.js");
        
        var gameObject;
        var server;
        var guild;

        console.log(`Post values received:\n`, values);

        if (hostingSessionsStore.doesSessionExist(values.userId, values.token) === false)
        {
            console.log("Session does not exist; cannot host.");
            return res.send("Session does not exist!");
        }

        gameObject = hostingSessionsStore.getSessionGameObject(values.userId);

        hostingSessionsStore.removeSession(values.userId);


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

        guild = guildStore.getGuildWrapperById(values.guild);
        server = hostServerStore.getHostServerByName(values.server);

        if (server.isOnline() === false)
            return res.send(`Selected server is offline; cannot host game.`);

        gameObject.setGuild(guild);
        gameObject.setServer(server);

        server.reserveGameSlot()
        .then((port) =>
        {
            gameObject.setPort(port);
            return gameObject.loadSettingsFromInput(values);
        })
        .then(() => gameObject.createNewChannel())
        .then(() => gameObject.createNewRole())
        .then(() => gameObject.pinSettingsToChannel())
        .then(() => gameObject.finishGameCreation())
        .then(() => Promise.resolve(res.send("Game has been hosted! Find the corresponding channel in the selected Discord guild.")))
        .catch((err) => 
        {
            console.log(err);
            res.send(`Error occurred when creating the game: ${err.message}`);
        });
    });


    //Below are routes used specifically to retrieve data
    expressApp.get("/guilds/:userId", (req, res) =>
    {
        var userId = req.params.userId;
        var availableGuilds = guildStore.getGuildClientData(userId);

        res.send(availableGuilds);
    });

    expressApp.get("/servers", (req, res) =>
    {
        var availableServers = hostServerStore.getAvailableServers();
        res.send(availableServers);
    });

    expressApp.get("/nations", (req, res) =>
    {
        var dom5nations = require("../json/dom5_nations.json");
        res.send(dom5nations);
    });

    expressApp.get("/maps/*", (req, res) =>
    {
        var serverName = req.url.replace("/maps/", "");
        var server = hostServerStore.getHostServerByName(serverName);

        if (server.isOnline() === false)
            res.send(["Selected server is offline"]);

        server.emitPromise("GET_MAP_LIST")
        .then((list) => res.send(list));
    });

    expressApp.get("/mods/*", (req, res) =>
    {
        var serverName = req.url.replace("/mods/", "");
        var server = hostServerStore.getHostServerByName(serverName);

        if (server.isOnline() === false)
            res.send(["Selected server is offline"]);

        server.emitPromise("GET_MOD_LIST")
        .then((list) => res.send(list));
    });
};