
//Extend functionality of basic types with a few methods
require("./helper_functions.js").extendPrototypes();

const configHelper = require("./config_helper.js");

var config;
var log;
var discord;
var expressServer;
var gamesStore;
var timeEventsEmitter;
var hostServerStore;
var playerFileStore;


Promise.resolve()
.then(() =>
{
    // Set up config by asking user in console
    if (configHelper.hasConfig() === false)
        return configHelper.askConfigQuestions();

    else return Promise.resolve();
})
.then(() =>
{
    // Load config and then begin initialization
    config = configHelper.buildDataPath();

    _initializeComponents();
});


function _initializeComponents()
{
    //import the modules required for initialization
    log = require("./logger.js");
    discord = require("./discord/discord.js");
    expressServer = require("./servers/express_server.js");
    gamesStore = require("./games/ongoing_games_store.js");
    timeEventsEmitter = require("./time_events_emitter.js");
    hostServerStore = require("./servers/host_server_store.js");
    playerFileStore = require("./player_data/player_file_store.js");

    //Begin initialization
    discord.startDiscordIntegration()
    .then(() =>
    {
        log.general(log.getLeanLevel(), "Finished Discord integration.");
        return playerFileStore.populate();
    })
    .then(() =>
    {
        log.general(log.getLeanLevel(), "Player data loaded.");
        return Promise.resolve(hostServerStore.populate());
    })
    .then(() =>
    {
        log.general(log.getLeanLevel(), "Finished populating server store.");
        return Promise.resolve(gamesStore.loadAll());
    })
    .then(() => 
    {
        log.general(log.getLeanLevel(), "Games loaded.");

        if (expressServer.isHttpsAvailable() === true)
            expressServer.startListeningSsl(config.hostServerSslConnectionPort);

        expressServer.startListening(config.hostServerConnectionPort);
        return Promise.resolve();
    })
    .then(() => timeEventsEmitter.startCounting())
    .then(() => log.general(log.getLeanLevel(), "Initialized successfully."))
    .catch((err) => 
    {
        log.error(log.getLeanLevel(), `INITIALIZATION ERROR`, err)
        .then(() => process.exit());
    });
}


//Catch process exceptions and log them here
process.on("error", (err) => log.error(log.getLeanLevel(), `PROCESS ERROR`, err));
process.on("unhandledRejection", err => log.error(log.getLeanLevel(), `UNCAUGHT PROMISE ERROR`, err));
