


exports.set = (expressApp) => 
{
    expressApp.get("/", (req, res) => res.render("home_screen.ejs"));
};