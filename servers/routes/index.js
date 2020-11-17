


exports.set = (expressApp) => 
{
    expressApp.get("/", (req, res) => res.render("index.ejs"));
}