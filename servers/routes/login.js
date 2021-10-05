
const url = require("url");
const log = require("../../logger.js");
const oauth2 = require("../discord_oauth2.js");
const config = require("../../config/config.json");
const webSessionsStore = require("../web_sessions_store.js");
const ongoingGames = require("../../games/ongoing_games_store.js");


exports.set = (expressApp) => 
{
    expressApp.get("/authenticate", (req, res) =>
    {
        res.redirect(config.oAuth2Url);
    });


    expressApp.get("/login", (req, res) =>
    {
        const urlObject = new url.URL("http://www." + req.hostname + req.originalUrl);

        log.general(log.getVerboseLevel(), `Login request received with urlObject: ${urlObject.searchParams.get("code")}`);

        oauth2.authenticate(urlObject)
        .then((userInfo) => 
        {
            var playedGames;
            var organizedGames;
            const userId = userInfo.id;

            if (userId == null)
                return log.general(log.getVerboseLevel(), "Invalid login attempt, ignoring.");

            const session = webSessionsStore.createSession(userId);
            const sessionId = session.getSessionId();
            res.cookie("sessionId", sessionId);
            log.general(log.getVerboseLevel(), `Request authenticated! userId: ${userId}, sessionId: ${sessionId}, cookie set`);

            playedGames = _getPlayedGamesData(userId);
            organizedGames = _getOrganizedGamesData(userId);
            console.log(organizedGames);
            
            session.storeSessionData({
                sessionId, 
                userId,
                playedGames,
                organizedGames
            });

            session.redirectTo("user_home_screen", res);
        })
        .catch((err) => res.render("results_screen.ejs", { result: `Error occurred: ${err.message}` }));
    });
};


function _getPlayedGamesData(userId)
{
    const games = ongoingGames.getGamesWhereUserIsPlayer(userId);
    return games.map(_extractGameInfo);
}

function _getOrganizedGamesData(userId)
{
    const games = ongoingGames.getGamesWhereUserIsOrganizer(userId);
    return games.map(_extractGameInfo);
}

function _extractGameInfo(game)
{
    const statusData = game.getLastKnownStatus();

    return {
        name: game.getName(),
        guild: game.getGuild()?.getName(),
        server: game.getServer()?.getName(),
        organizer: game.getOrganizer()?.getNameInGuild(),
        organizerId: game.getOrganizerId(),
        ip: game.getIp(),
        port: game.getPort(),
        status: statusData?.getStatus(),
        turnNumber: statusData?.getTurnNumber(),
        timeLeft: statusData?.getTimeLeft()?.printTimeLeftShort(),
        isPaused: statusData?.isPaused()
    };
}