exports.set = (expressApp) => 
{
    expressApp.get("/donate", (req, res) =>
    {

        res.render("donate.ejs");
        
    });
};