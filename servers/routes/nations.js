

exports.set = (expressApp) => 
{
    expressApp.get("/nations", (req, res) =>
    {
        let dom5nations = require("../json/dom5_nations.json");
        res.send(dom5nations);
    });
};