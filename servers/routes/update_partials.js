
const ejs = require("ejs");
const hostServerStore = require("../host_server_store.js");


exports.set = (expressApp) => 
{
    /*expressApp.get("/update_ai_partial/:eraNbr", (req, res) =>
    {
        const dom5Nations = require("../../json/dom5_nations.json");
        const era = req.params.eraNbr;
        const nations = dom5Nations[era];
        
        ejs.renderFile("./client/partials/ai_nation_list.ejs", { nations }, (err, compiledStr) =>
        {
            if (err)
                res.send(`Error when fetching ai list: ${err.message}`);

            res.send(compiledStr);
        });
    });*/

    expressApp.get("/update_mod_partial/:serverName", (req, res) =>
    {
        const serverName = req.params.serverName;
        const server = hostServerStore.getHostServerByName(serverName);

        if (server.isOnline() === false)
            return res.send("Selected server is offline");

        server.emitPromise("GET_MOD_LIST")
        .then((mods) => 
        {
            ejs.renderFile("./client/partials/settings/mod_list.ejs", { mods }, (err, compiledHthml) =>
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
            ejs.renderFile("./client/partials/settings/map_list.ejs", { maps }, (err, compiledHthml) =>
            {
                if (err)
                    res.send(`Error when fetching maps: ${err.message}`);

                res.send(compiledHthml);
            });
        });
    });
};