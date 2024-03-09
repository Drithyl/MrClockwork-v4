
//Extend functionality of basic types with a few methods
require("./helper_functions.js").extendPrototypes();

const configHelper = require("./config_helper.js");

let config;
let log;
let cleaner;
let discord;
let patcher;
let expressServer;
let gamesStore;
let hostServerStore;
let playerFileStore;
let fileDownloader;


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


async function _initializeComponents()
{
    //import the modules required for initialization
    log = require("./logger.js");
    cleaner = require("./cleaner.js");
    discord = require("./discord/index.js");
    patcher = require("./patcher/patcher.js");
    expressServer = require("./servers/express_server.js");
    gamesStore = require("./games/ongoing_games_store.js");
    hostServerStore = require("./servers/host_server_store.js");
    playerFileStore = require("./player_data/player_file_store.js");
    fileDownloader = require("./downloader/file_downloader.js");

    //Catch process exceptions and log them here
    process.on("error", (err) => log.error(log.getLeanLevel(), `PROCESS ERROR`, err));
    process.on("unhandledRejection", err => log.error(log.getLeanLevel(), `UNHANDLED REJECTION ERROR`, err));
    process.on("uncaughtException", err => log.error(log.getLeanLevel(), `UNCAUGHT EXCEPTION ERROR`, err));

    // Gracefully shut down if the process is terminated with Ctrl+C or other forceful means
    process.on("SIGINT", () =>
    {
        log.general(log.getLeanLevel(), `Gracefully shutting down...`);
        process.exit(2);
    });

    try
    {
        await patcher.runPatchers();
        log.general(log.getLeanLevel(), "Finished patching data.");
    
        await discord.startDiscordIntegration();
        log.general(log.getLeanLevel(), "Finished Discord integration.");
    
        await playerFileStore.populate();
        log.general(log.getLeanLevel(), "Player data loaded.");
    
        hostServerStore.populate();
        log.general(log.getLeanLevel(), "Finished populating server store.");
    
        await gamesStore.loadAll();
        log.general(log.getLeanLevel(), "Finished initialization of games.");

    
        if (expressServer.isHttpsAvailable() === true)
            expressServer.startListeningSsl(config.hostServerSslConnectionPort);
    
        expressServer.startListening(config.hostServerConnectionPort);


        cleaner.startCleaningInterval();
        log.general(log.getLeanLevel(), "Initialized successfully.");
    }
    
    catch(err)
    {
        log.error(log.getLeanLevel(), `INITIALIZATION ERROR`, err);
        process.exit();
    }
}

