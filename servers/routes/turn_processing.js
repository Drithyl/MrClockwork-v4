
const log = require("../../logger.js");
const serverStore = require("../host_server_store.js");
const gamesStore = require("../../games/ongoing_games_store.js");

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

        const status = game.getLastKnownStatus();
        status.setIsTurnProcessing(isTurnProcessing);

        if (isTurnProcessing === true)
        {
            log.general(log.getNormalLevel(), `${game.getName()}: Turn started processing.`);
            game.sendMessageToChannel(`New turn just started processing. It may take a long time if other turns are processing.`);
        }

        else if (isTurnProcessing === false)
        {
            log.general(log.getNormalLevel(), `${game.getName()}: Turn finished processing.`);
            game.sendMessageToChannel(`New turn finished processing. The announcement should follow shortly.`);
        }

        res.sendStatus(200);
    });
};