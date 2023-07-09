const log = require("../../../logger.js");
const TimeLeft = require("../../../games/prototypes/time_left.js");

module.exports =
{
    name: "rateLimit",
    execute: (rateLimitData) =>
    {
        const timeLeft = new TimeLeft(rateLimitData.timeout);
        log.general(log.getLeanLevel(), `Rate limit reached; it will expire in ${timeLeft.printTimeLeft()}`, rateLimitData);
    }
};