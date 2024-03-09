
const assert = require("../../asserter.js");
const webSessionsStore = require("../web_sessions_store.js");
const ongoingGames = require("../../games/ongoing_games_store.js");


exports.set = (expressApp) => 
{
    expressApp.get("/user_home_screen", (req, res) =>
    {
        let userId;
        let sessionId;
        let playedGames;
        let organizedGames;

        // Fetch session from either the URL params or the cookies, wherever we can find the sessionId
        const session = webSessionsStore.getSessionFromUrlParams(req) ?? webSessionsStore.getSessionFromCookies(req);

        if (session == null)
            return res.redirect("/authenticate");

        userId = session.getUserId();
        sessionId = session.getSessionId();
        playedGames = _getPlayedGamesData(userId);
        organizedGames = _getOrganizedGamesData(userId);
        
        session.storeSessionData({
            sessionId, 
            userId,
            playedGames,
            organizedGames
        });

        res.render("user_home_screen.ejs", session.getSessionData());
    });
};


function _getPlayedGamesData(userId)
{
    const games = ongoingGames.getGamesWhereUserIsPlayer(userId);
    return games.map((game) => _extractGameInfo(game, userId));
}

function _getOrganizedGamesData(userId)
{
    const games = ongoingGames.getGamesWhereUserIsOrganizer(userId);
    return games.map((game) => _extractGameInfo(game, userId));
}

function _extractGameInfo(game, userId)
{
    const statusData = game.getLastKnownStatus();
    let timeLeft;

    if (statusData.isTurnProcessing() === true)
        timeLeft = "Processing...";

    else if (statusData.hasStarted() === true)
        timeLeft = statusData?.getTimeLeft()?.printTimeLeftShort();
    
    else if (statusData.hasStarted() === false)
        timeLeft = "Unstarted";

    else timeLeft = "Unknown";


    return {
        name: game.getName(),
        guild: game.getGuild()?.getName(),
        server: game.getServer()?.getName(),
        organizer: game.getOrganizer()?.getNameInGuild(),
        organizerId: game.getOrganizerId(),
        ip: game.getIp(),
        port: game.getPort(),
        status: statusData.getStatusString(),
        turnNumber: statusData?.getTurnNumber(),
        timeLeft: timeLeft,
        isPaused: statusData?.isPaused(),
        turnStatus: _extractGameTurnStatus(game, userId)
    };
}

function _extractGameTurnStatus(game, userId)
{
    const statusData = game.getLastKnownStatus();
    const nations = statusData.getPlayers();
    let humanNations;
    let controlledNations;
    let allTurnsFinished;
    let allTurnsAtLeastUnfinished;


    if (assert.isArray(nations) === false)
        return "Data unavailable";


    humanNations = nations.filter((nation) => nation.isHuman);
    controlledNations = humanNations.filter((nation) => game.isPlayerControllingNation(userId, nation.filename));
    allTurnsFinished = controlledNations.every((nation) => nation.isTurnFinished);


    if (controlledNations.length <= 0)
        return "No controlled nation";

    if (allTurnsFinished === true)
        return "Finished";
    
    allTurnsAtLeastUnfinished = controlledNations.every((nation) => 
    {
        return nation.isTurnFinished === true || nation.isTurnUnfinished === true;
    });

    if (allTurnsAtLeastUnfinished === true)
        return "Unfinished";

    return "Unchecked!";
}