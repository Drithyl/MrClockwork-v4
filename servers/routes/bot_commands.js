exports.set = (expressApp) => 
{
    expressApp.get("/bot_commands", (req, res) =>
    {

        res.render("bot_commands.ejs");
        
    });
};