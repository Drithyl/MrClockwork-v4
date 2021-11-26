
const gamePatcher = require("./game_patcher.js");
const guildPatcher = require("./guild_patcher.js");

module.exports.runPatchers = async () =>
{
    try
    {
        guildPatcher();
        await gamePatcher();
    }

    catch(err)
    {
        throw new Error(`PATCHING ERROR: ${err.message}\n\n${err.stack}`);
    }
};

