
const hostServerStore = require("../host_server_store.js");


exports.set = (expressApp) => 
{
    expressApp.get("/servers", (req, res) =>
    {
        var availableServers = hostServerStore.getAvailableServersClientData();
        res.send(availableServers);
    });
};