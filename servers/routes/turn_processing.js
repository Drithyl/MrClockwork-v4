
const log = require("../../logger.js");
const serverStore = require("../host_server_store.js");
const gamesStore = require("../../games/ongoing_games_store.js");
const onTurnStartedProcessing = require("../../games/event_handlers/turn_started_processing.js");
const onTurnFinishedProcessing = require("../../games/event_handlers/turn_finished_processing.js");
const onPreTurnProcessingFinished = require("../../games/event_handlers/pre_turn_processing_finished.js");
const onPostTurnProcessingFinished = require("../../games/event_handlers/post_turn_processing_finished.js");


exports.set = (expressApp) => 
{
    expressApp.post("/turn_processing", (req, res) =>
    {
        const values = req.body;
        const gameName = values.gameName;
        const serverToken = values.serverToken;
        const status = values.status;
        const turnNumber = values.turnNumber;
        const statusdump = values.statusdump;
        const error = values.error;
        const game = gamesStore.getOngoingGameByName(gameName);

        log.general(log.getNormalLevel(), `turn_processing POST values received`, values);


        if (serverStore.hasHostServerById(serverToken) === false)
            return res.sendCode(401);

        if (game == null)
        {
            log.error(log.getLeanLevel(), `ERROR: Received turn_processing POST for game ${gameName}, but game can't be found in the store`);
            return res.status(400).send(`Game ${gameName} could not be found`);
        }

        if (status === 'preexec-start')
            onTurnStartedProcessing(game);

        else if (status === 'preexec-finish')
            onPreTurnProcessingFinished(game, turnNumber);

        else if (status === 'preexec-error')
            onPreTurnProcessingFinished(game, turnNumber, error);

        else if (status === 'postexec-start')
            onTurnFinishedProcessing(game);

        else if (status === 'postexec-finish')
            onPostTurnProcessingFinished(game, statusdump);

        else if (status === 'postexec-error')
            onPostTurnProcessingFinished(game, statusdump, error);


        res.sendStatus(200);
    });
};