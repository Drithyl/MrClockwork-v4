
//Extend functionality of basic types with a few methods
require("./helper_functions.js").extendPrototypes();

const configHelper = require("./config_helper.js");

var config;
var rw;
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
    rw = require("./reader_writer.js");
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
        console.log("Finished Discord integration.");
        return playerFileStore.populate();
    })
    .then(() =>
    {
        console.log("Player data loaded.");
        return Promise.resolve(hostServerStore.populate());
    })
    .then(() =>
    {
        console.log("Finished populating server store.");
        return Promise.resolve(gamesStore.loadAll());
    })
    .then(() => 
    {
        console.log("Games loaded.");

        if (expressServer.isHttpsAvailable() === true)
            expressServer.startListeningSsl(config.hostServerSslConnectionPort);

        expressServer.startListening(config.hostServerConnectionPort);
        return Promise.resolve();
    })
    .then(() => 
    {
        
        return timeEventsEmitter.startCounting();
    })
    .then(() => 
    {
        console.log("Initialized successfully.");
    })
    .catch((err) => 
    {
        console.log(err);
        process.exit();
    });
}


//Catch process exceptions and log them here
process.on("unhandledRejection", err =>
{
    console.log(err);
    rw.log(["error"], `Uncaught Promise Error: \n${err.stack}`);
});

process.on("error", (err) => rw.log(["error"], `Process Error:\n\n${err.stack}`));
