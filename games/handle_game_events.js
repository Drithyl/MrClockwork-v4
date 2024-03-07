
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


module.exports = (game, domEvents) =>
{
    if (domEvents.didServerGoOffline() === true)
        handleServerWentOffline(game);

    else if (domEvents.isServerBackOnline() === true)
        handleServerBackOnline(game);


    if (domEvents.didGameGoOffline() === true)
        handleGameWentOffline(game);
    
    else if (domEvents.isGameBackOnline() === true)
        handleGameBackOnline(game);


    if (domEvents.didGameStart() === true)
        handleGameStarted(game);

    else if (domEvents.isNewTurn() === true)
        handleNewTurn(game, domEvents);

    else if (domEvents.isTurnRollback() === true)
        handleTurnRollback(game, domEvents);

    
    if (domEvents.didTimerRunOut() === true)
        handleTimerRanOut(game);

    else if (domEvents.isLastHourBeforeTurn() === true)
        handleLastTurnHour(game);

    else if (domEvents.didHourPass() === true)
        handleHourPassed(game, domEvents);

    
    if (domEvents.areAllTurnsDone() === true)
        handleAllTurnsDone(game);
};
