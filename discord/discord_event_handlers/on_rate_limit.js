
const log = require("../../logger.js");
const TimeLeft = require("../../games/prototypes/time_left.js")
const botClientWrapper = require("../wrappers/bot_client_wrapper.js");


exports.startListening = () =>
{
    log.general(log.getNormalLevel(), "Listening to onRateLimit.");
    botClientWrapper.addOnRateLimitHandler(_onRateLimit);
};

function _onRateLimit(rateLimitData)
{
    const timeLeft = new TimeLeft(rateLimitData.timeout);
    log.general(log.getLeanLevel(), `Rate limit reached; it will expire in ${timeLeft.printTimeLeft()}`, rateLimitData);
}