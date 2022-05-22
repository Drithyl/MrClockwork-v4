
const log = require("../../logger.js");
const serverStore = require("../host_server_store.js");
const gamesStore = require("../../games/ongoing_games_store.js");
const turnStartedProcessing = require("../../games/event_handlers/turn_started_processing.js");
const turnFinishedProcessing = require("../../games/event_handlers/turn_finished_processing.js");


exports.set = (expressApp) => 
{
    expressApp.post("/turn_processing", (req, res) =>
    {
        const values = req.body;
        const gameName = values.gameName;
        const serverToken = values.serverToken;
        const isTurnProcessing = values.isTurnProcessing;
        const game = gamesStore.getOngoingGameByName(gameName);

        log.general(log.getNormalLevel(), `turn_processing POST values received`, values);


        if (serverStore.hasHostServerById(serverToken) === false)
            return res.sendCode(401);

        if (game == null)
        {
            log.error(log.getLeanLevel(), `ERROR: Received turn_processing POST for game ${gameName}, but game can't be found in the store`);
            return res.status(400).send(`Game ${gameName} could not be found`)
        }


        if (isTurnProcessing === true)
            turnStartedProcessing(game);
            
        else if (isTurnProcessing === false)
            turnFinishedProcessing(game);


        res.sendStatus(200);
    });
};