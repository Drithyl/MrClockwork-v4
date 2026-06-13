
const ejs = require("ejs");
const hostServerStore = require("../host_server_store.js");


exports.set = (expressApp) => 
{
    expressApp.get("/update_mod_partial/:serverName", (req, res) =>
    {
        const serverName = req.params.serverName;
        const gameType = req.params.gameType;
        const server = hostServerStore.getHostServerByName(serverName);

        if (server.isOnline() === false)
            return res.send("Selected server is offline");

        server.emitPromise("GET_MOD_LIST", gameType)
        .then((mods) => 
        {
            ejs.renderFile("./client/partials/settings/mod_list_select_content.ejs", { mods }, (err, compiledHthml) =>
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
        const gameType = req.params.gameType;
        const server = hostServerStore.getHostServerByName(serverName);
    
        if (server.isOnline() === false)
            return res.send("Selected server is offline");
    
        server.emitPromise("GET_MAP_LIST", gameType)
        .then((maps) => 
        {
            ejs.renderFile("./client/partials/settings/map_list_select_content.ejs", { maps }, (err, compiledHthml) =>
            {
                if (err)
                    res.send(`Error when fetching maps: ${err.message}`);

                res.send(compiledHthml);
            });
        });
    });
};