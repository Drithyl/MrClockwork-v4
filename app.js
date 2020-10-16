//Extend functionality of basic types with a few methods
require("./prototype_functions.js").extendPrototypes();


//import the modules required for initialization
const rw = require("./reader_writer.js");
const config = require("./config/config.json");
const discord = require("./discord/discord.js");
const expressServer = require("./servers/express_server.js");
const gamesStore = require("./games/ongoing_games_store.js");
const timeEventsEmitter = require("./time_events_emitter.js");
const hostServerStore = require("./servers/host_server_store.js");


//Begin initialization
discord.startDiscordIntegration()
.then(() =>
{
  console.log("Finished Discord integration.");
  return Promise.resolve(hostServerStore.populate());
})
.then(() =>
{
  console.log("Finished Populating server store.");
  return Promise.resolve(gamesStore.loadAll());
})
.then(() => 
{
  console.log("Games loaded.");
  return expressServer.startListeningOnPort(config.hostServerConnectionPort);
})
.then(() => 
{
  console.log(`Listening for connections on port ${config.hostServerConnectionPort}.`);
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


//Catch process exceptions and log them here
process.on("unhandledRejection", err =>
{
  rw.log(["error"], `Uncaught Promise Error: \n${err.stack}`);
});

process.on("error", (err) => rw.log(["error"], `Process Error:\n\n${err.stack}`));
