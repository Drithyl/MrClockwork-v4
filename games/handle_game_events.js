
const handleServerWentOffline = require("./event_handlers/server_went_offline.js");
const handleServerBackOnline = require("./event_handlers/server_back_online.js");
const handleGameWentOffline = require("./event_handlers/game_went_offline.js");
const handleGameBackOnline = require("./event_handlers/game_back_online.js");
const handleGameStarted = require("./event_handlers/game_started.js");
const handleNewTurn = require("./event_handlers/new_turn.js");
const handleTurnRollback = require("./event_handlers/turn_rollback.js");
const handleTimerRanOut = require("./event_handlers/timer_ran_out.js");
const handleLastTurnHour = require("./event_handlers/last_turn_hour.js");
const handleHourPassed = require("./event_handlers/hour_passed.js");
const handleAllTurnsDone = require("./event_handlers/all_turns_done.js");


module.exports = (game, dom5Events) =>
{
    if (dom5Events.didServerGoOffline() === true)
        handleServerWentOffline(game);

    else if (dom5Events.isServerBackOnline() === true)
        handleServerBackOnline(game);


    if (dom5Events.didGameGoOffline() === true)
        //handleGameWentOffline(game);
    
    else if (dom5Events.isGameBackOnline() === true)
        //handleGameBackOnline(game);


    if (dom5Events.didGameStart() === true)
        handleGameStarted(game);

    else if (dom5Events.isNewTurn() === true)
        handleNewTurn(game, dom5Events);

    else if (dom5Events.isTurnRollback() === true)
        handleTurnRollback(game, dom5Events);

    
    if (dom5Events.didTimerRunOut() === true)
        handleTimerRanOut(game);

    else if (dom5Events.isLastHourBeforeTurn() === true)
        handleLastTurnHour(game);

    else if (dom5Events.didHourPass() === true)
        handleHourPassed(game, dom5Events);

    
    if (dom5Events.areAllTurnsDone() === true)
        handleAllTurnsDone(game);
}
