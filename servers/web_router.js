
const path = require("path");

const indexRoute = require("./routes/index.js");
const statusRoute = require("./routes/status.js");
const userHomeScreenRoute = require("./routes/user_home_screen.js");
const resultRoute = require("./routes/result.js");
const guildsRoute = require("./routes/guilds.js");
const loginRoute = require("./routes/login.js");
const logoutRoute = require("./routes/logout.js");
const mapsRoute = require("./routes/maps.js");
const modsRoute = require("./routes/mods.js");
const nationsRoute = require("./routes/nations.js");
const serversRoute = require("./routes/servers.js");
const hostDom5Route = require("./routes/host_dom5.js");
const hostDom6Route = require("./routes/host_dom6.js");
const updatePartialsRoute = require("./routes/update_partials.js");
const editPreferencesRoute = require("./routes/edit_preferences.js");
const changeDom5SettingsRoute = require("./routes/change_dom5_settings.js");
const changeDom6SettingsRoute = require("./routes/change_dom6_settings.js");
const turnProcessingRoute = require("./routes/turn_processing.js");

// new content routes
const aboutRoute = require("./routes/about.js");
const botCommandsRoute = require("./routes/bot_commands.js");
const donateRoute = require("./routes/donate.js");

const cookieParser = require("cookie-parser");

exports.setMiddlewares = (expressApp, express) =>
{
    //Set the middleware used to handle incoming HTTP requests.
    //static() will serve all files within the provided directory, including css or js
    expressApp.use(express.static(path.join(__dirname + "/../client")));
    expressApp.use(express.json());
    expressApp.use(express.urlencoded({ extended: true }));
    expressApp.use(cookieParser());

    expressApp.set("views", path.join(__dirname + "/../client/views"));
    expressApp.set("view engine", "ejs");
    expressApp.engine("html", require("ejs").renderFile);
};

exports.setRoutes = (expressApp) =>
{
    indexRoute.set(expressApp);
    statusRoute.set(expressApp);
    userHomeScreenRoute.set(expressApp);
    guildsRoute.set(expressApp);
    loginRoute.set(expressApp);
    logoutRoute.set(expressApp);
    resultRoute.set(expressApp);
    mapsRoute.set(expressApp);
    modsRoute.set(expressApp);
    nationsRoute.set(expressApp);
    serversRoute.set(expressApp);
    hostDom5Route.set(expressApp);
    hostDom6Route.set(expressApp);
    updatePartialsRoute.set(expressApp);
    editPreferencesRoute.set(expressApp);
    changeDom5SettingsRoute.set(expressApp);
    changeDom6SettingsRoute.set(expressApp);
    aboutRoute.set(expressApp);
    botCommandsRoute.set(expressApp);
    donateRoute.set(expressApp);
    turnProcessingRoute.set(expressApp);
};