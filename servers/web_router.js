
const path = require("path");

const indexRoute = require("./routes/index.js");
const userHomeScreenRoute = require("./routes/user_home_screen.js");
const resultRoute = require("./routes/result.js");
const guildsRoute = require("./routes/guilds.js");
const loginRoute = require("./routes/login.js");
const mapsRoute = require("./routes/maps.js");
const modsRoute = require("./routes/mods.js");
const nationsRoute = require("./routes/nations.js");
const serversRoute = require("./routes/servers.js");
const hostGameRoute = require("./routes/host_game.js");
const updatePartialsRoute = require("./routes/update_partials.js");
const editPreferencesRoute = require("./routes/edit_preferences.js");
const changeGameSettingsRoute = require("./routes/change_game_settings.js");
const cookieParser = require("cookie-parser");

exports.setMiddlewares = (expressApp, express) =>
{
    //Set the middleware used to handle incoming HTTP requests.
    //static() will serve all files within the provided directory, including css or js
    expressApp.use(express.static(path.join(__dirname + "/../client")));
    expressApp.use(express.json());
    expressApp.use(express.urlencoded());
    expressApp.use(cookieParser());

    expressApp.set("views", path.join(__dirname + "/../client/views"));
    expressApp.set("view engine", "ejs");
    expressApp.engine("html", require("ejs").renderFile);
};

exports.setRoutes = (expressApp) =>
{
    indexRoute.set(expressApp);
    userHomeScreenRoute.set(expressApp);
    guildsRoute.set(expressApp);
    loginRoute.set(expressApp);
    resultRoute.set(expressApp);
    mapsRoute.set(expressApp);
    modsRoute.set(expressApp);
    nationsRoute.set(expressApp);
    serversRoute.set(expressApp);
    hostGameRoute.set(expressApp);
    updatePartialsRoute.set(expressApp);
    editPreferencesRoute.set(expressApp);
    changeGameSettingsRoute.set(expressApp);
};