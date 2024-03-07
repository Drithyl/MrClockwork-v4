
const log = require("../../logger.js");
const hostServerStore = require("../host_server_store.js");


exports.set = (expressApp) => 
{
    expressApp.get("/mods/*", (req, res) =>
    {
        var serverName = req.url.replace("/mods/", "");
        var gameType = req.url.replace("");
        var server = hostServerStore.getHostServerByName(serverName);

        if (server.isOnline() === false)
            res.send(["Selected server is offline"]);

        server.emitPromise("GET_MOD_LIST", gameType)
        .then((list) => res.send(list))
        .catch((err) => 
        {
            res.send([]);
            log.error(log.getNormalLevel(), `Could not fetch mods from ${serverName}: ${err.message}`);
        });
    });
};