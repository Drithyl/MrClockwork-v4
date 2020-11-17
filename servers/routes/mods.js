
const hostServerStore = require("../host_server_store.js");


exports.set = (expressApp) => 
{
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