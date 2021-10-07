
const serverStore = require("../host_server_store.js");


exports.set = (expressApp) => 
{
    expressApp.get("/status_screen", (req, res) => 
    {
        const servers = [];

        serverStore.forEachServer((server) =>
        {
            servers.push({
                name: server.getName(),
                status: (server.isOnline() === true) ? "Online" : "Offline",
                availableSlots: (server.isOnline() === true) ? server.getAvailableSlots() : "-",
                maxSlots: (server.isOnline() === true) ? server.getTotalCapacity() : "-"
            });
        });

        res.render("status_screen.ejs", {
            servers
        });
    });
};