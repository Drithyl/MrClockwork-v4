
const log = require("../../logger.js");
const serverStore = require("../host_server_store.js");
const gamesStore = require("../../games/ongoing_games_store.js");
const turnStartedProcessing = require("../../games/event_handlers/turn_started_processing.js");
const turnFinishedProcessing = require("../../games/event_handlers/turn_finished_processing.js");
const backupFinished = require("../../games/event_handlers/backup_finished.js");


exports.set = (expressApp) => 
{
    expressApp.post("/turn_processing", (req, res) =>
    {
        const values = req.body;
        const gameName = values.gameName;
        const serverToken = values.serverToken;
        const status = values.status;
        const turnNumber = values.turnNumber;
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
            turnStartedProcessing(game);

        else if (status === 'preexec-finish')
            backupFinished(game, { preexec: true, turnNumber });

        else if (status === 'preexec-error')
            backupFinished(game, { preexec: true, error });

        else if (status === 'postexec-start')
            turnFinishedProcessing(game);

        else if (status === 'postexec-finish')
            backupFinished(game, { postexec: true, turnNumber });

        else if (status === 'postexec-error')
            backupFinished(game, { postexec: true, error });


        res.sendStatus(200);
    });
};