
const hostServerStore = require("../host_server_store.js");

exports.set = (expressApp) => 
{
    expressApp.get("/maps/*", (req, res) =>
    {
        var serverName = req.url.replace("/maps/", "");
        var server = hostServerStore.getHostServerByName(serverName);

        if (server.isOnline() === false)
            res.send(["Selected server is offline"]);

        server.emitPromise("GET_MAP_LIST")
        .then((list) => res.send(list))
        .catch((err) => 
        {
            res.send([]);
            log.error(log.getNormalLevel(), `Could not fetch maps from ${serverName}: ${err.message}`);
        });
    });
};