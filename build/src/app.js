"use strict";
//Extend functionality of basic types with a few methods
require("./prototype_functions.js").extendPrototypes();
//import the modules required for initialization
var rw = require("./reader_writer.js");
var config = require("./config/config.json");
var discord = require("./discord/discord.js");
var expressServer = require("./servers/express_server.js");
var gamesStore = require("./games/ongoing_games_store.js");
var timeEventsEmitter = require("./time_events_emitter.js");
var hostServerStore = require("./servers/host_server_store.js");
//Begin initialization
return discord.startDiscordIntegration()
    .then(function () {
    console.log("Finished Discord integration.");
    return Promise.resolve(hostServerStore.populate());
})
    .then(function () {
    console.log("Finished Populating server store.");
    return Promise.resolve(gamesStore.loadAll());
})
    .then(function () {
    console.log("Games loaded.");
    return expressServer.startListeningOnPort(config.hostServerConnectionPort);
})
    .then(function () {
    console.log("Listening for connections on port " + config.hostServerConnectionPort + ".");
    return timeEventsEmitter.startCounting();
})
    .then(function () {
    console.log("Initialized successfully.");
})
    .catch(function (err) {
    console.log(err);
    process.exit();
});
//Catch process exceptions and log them here
process.on("unhandledRejection", function (err) {
    rw.log(["error"], "Uncaught Promise Error: \n" + err.stack);
});
process.on("error", function (err) { return rw.log(["error"], "Process Error:\n\n" + err.stack); });
//# sourceMappingURL=app.js.map