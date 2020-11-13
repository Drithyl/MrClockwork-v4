
const url = require("url");
const ejs = require("ejs");
const path = require("path");
const oauth2 = require("./discord_oauth2.js")
const guildStore = require("../discord/guild_store.js");
const hostServerStore = require("./host_server_store.js");
const webSessionsStore = require("./web_sessions_store.js");

exports.setMiddlewares = (expressApp, express) =>
{
    //Set the middleware used to handle incoming HTTP requests.
    //static() will serve all files within the provided directory, including css or js
    expressApp.use(express.static(path.join(__dirname + "/../client")));
    expressApp.use(express.json());
    expressApp.use(express.urlencoded());

    expressApp.set("views", path.join(__dirname + "/../client/views"));
    expressApp.set("view engine", "ejs");
    expressApp.engine("html", require("ejs").renderFile);
};

exports.setRoutes = (expressApp) =>
{
    //default URL for website, handle incoming requests on root page
    expressApp.get("/", (req, res) => res.render("index.html"));

    expressApp.get("/login", (req, res) =>
    {
        const urlObject = url.parse(req.url, true);

        oauth2.authenticate(urlObject)
        .then((userInfo) => 
        {
            const guildData = [];
            const userId = userInfo.id;
            const guildsWhereUserIsMember = guildStore.getGuildsWhereUserIsMember(userId);
            const availableServers = hostServerStore.getAvailableServers();

            guildsWhereUserIsMember.forEach((wrapper) =>
            {
                guildData.push({
                    id: wrapper.getId(),
                    name: wrapper.getName()
                })
            });
            
            /** redirect to host_game */
            res.render("host_game.ejs", {
                guilds: guildData, 
                servers: availableServers
            });
        })
        .catch((err) => res.send(`Error occurred: ${err.message}`));
    });

    //Get the params from the url itself instead of turning it into a route;
    //otherwise the route will act as the base path for which the host_game.html
    //file looks up the styling and js files, and will not find them. Must then
    //sendFile() as a return to preserve the URL that contains these parameters,
    //since they will also be extracted in the client
    expressApp.get("/host_game", (req, res) =>
    {
        const authenticationParams = _extractAuthenticationParams(req.url);
        console.log("Host game authentication params:", authenticationParams);

        if (_isAuthenticationValid(authenticationParams) === true)
        {
            const hostGamePath = path.join(__dirname + "/../client/host_game.html");
            return res.sendFile(hostGamePath);
        }

        else return res.send("Session does not exist!");
    });

    expressApp.get("/preferences", (req, res) =>
    {
        const authenticationParams = _extractAuthenticationParams(req.url);
        console.log("Host game authentication params:", authenticationParams);

        if (_isAuthenticationValid(authenticationParams) === true)
        {
            const preferencesPath = path.join(__dirname + "/../client/preferences.html");
            return res.sendFile(preferencesPath);
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

        if (_isAuthenticationValid(values) === false)
        {
            console.log("Session does not exist; cannot host.");
            return res.send("Session does not exist!");
        }

        gameObject = webSessionsStore.getSessionData(values.userId);

        webSessionsStore.removeSession(values.userId);


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

    expressApp.post("/preferences", (req, res) =>
    {
        const values = req.body;
        var playerFile;

        console.log(`Post values received:\n`, values);

        if (_isAuthenticationValid(values) === false)
        {
            console.log("Session does not exist; cannot edit preferences.");
            return res.send("Session does not exist!");
        }

        playerFile = webSessionsStore.getSessionData(values.userId);
        webSessionsStore.removeSession(values.userId);
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


    //Below are routes used specifically to retrieve data
    expressApp.get("/game_preferences/:userId", (req, res) =>
    {
        const userId = req.params.userId;
        const playerFile = webSessionsStore.getSessionData(userId);
        const gameData = playerFile.getAllGameData();
        const dataToSend = {};

        gameData.forEach((gameData) =>
        {
            const gameName = gameData.getGameName();
            const preferences = gameData.getDominionsPreferences();

            dataToSend[gameName] = {
                name: gameName,
                sendTurns: preferences.isReceivingBackups(),
                sendScores: preferences.isReceivingScores(),
                sendReminderWhenTurnDone: preferences.isReceivingRemindersWhenTurnIsDone(),
                reminders: preferences.getReminders()
            };
        });

        res.send(dataToSend);
    });

    

    expressApp.get("/update_ai_partial/:eraNbr", (req, res) =>
    {
        const dom5Nations = require("../json/dom5_nations.json");
        const era = req.params.eraNbr;
        const nations = dom5Nations[era];
        
        ejs.renderFile("./client/partials/ai_nation_list.ejs", { nations }, (err, compiledStr) =>
        {
            if (err)
                res.send(`Error when fetching ai list: ${err.message}`);

            res.send(compiledStr);
        });
    });

    expressApp.get("/update_mod_partial/:serverName", (req, res) =>
    {
        const serverName = req.params.serverName;
        const server = hostServerStore.getHostServerByName(serverName);

        if (server.isOnline() === false)
            return res.send("Selected server is offline");

        server.emitPromise("GET_MOD_LIST")
        .then((mods) => 
        {
            ejs.renderFile("./client/partials/mod_list.ejs", { mods }, (err, compiledHthml) =>
            {
                if (err)
                    res.send(`Error when fetching mods: ${err.message}`);

                res.send(compiledHthml);
            });
        });
    });

    expressApp.get("/update_map_partial/:serverName", (req, res) =>
    {
        const serverName = req.params.serverName;
        const server = hostServerStore.getHostServerByName(serverName);

        if (server.isOnline() === false)
            return res.send("Selected server is offline");

        server.emitPromise("GET_MAP_LIST")
        .then((maps) => 
        {
            ejs.renderFile("./client/partials/map_list.ejs", { maps }, (err, compiledHthml) =>
            {
                if (err)
                    res.send(`Error when fetching mods: ${err.message}`);

                res.send(compiledHthml);
            });
        });
    });
};

function _extractAuthenticationParams(url)
{
    const params = url.replace(/^\/\.+\?/, "");
    const userId = params.replace(/userId=(\d+)&token.+/i, "$1");
    const token = params.replace(/^.+&token=/i, "");

    return { userId, token };
}

function _isAuthenticationValid(authenticationParams)
{
    const userId = authenticationParams.userId;
    const token = authenticationParamstoken

    return webSessionsStore.doesSessionExist(userId, token);
}